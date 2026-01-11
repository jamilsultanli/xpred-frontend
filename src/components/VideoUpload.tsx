import { useState, useRef, useEffect } from 'react';
import { Upload, Video, Camera, X, Play } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { uploadApi } from '../lib/api/upload';
import { toast } from 'sonner';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
}

export function VideoUpload({ value, onChange, label = 'Upload Video', maxSizeMB = 100 }: VideoUploadProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Video size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      // Upload to backend which will store in Supabase Storage
      const response = await uploadApi.uploadVideo(file);
      if (response.success && response.url) {
        onChange(response.url);
        setPreview(response.url);
        toast.success('Video uploaded successfully');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload video');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setPreview(url);
        
        // Upload to backend
        setIsUploading(true);
        try {
          const response = await uploadApi.uploadVideo(blob);
          if (response.success && response.url) {
            onChange(response.url);
            setPreview(response.url);
            toast.success('Video recorded and uploaded successfully');
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (error: any) {
          toast.error(error.message || 'Failed to upload video');
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks(chunks);
      setIsRecording(true);
      mediaRecorder.start();
    } catch (error: any) {
      toast.error('Failed to access camera: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative">
          <video
            src={preview}
            controls
            className="w-full rounded-xl max-h-[400px] bg-black"
          />
          <button
            onClick={handleRemove}
            className={`absolute top-2 right-2 p-2 rounded-full ${isDark ? 'bg-black/80' : 'bg-white/80'} hover:opacity-80 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Web Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isRecording}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              } ${isUploading || isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Video</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Camera */}
          {navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (
            <div>
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white font-semibold`}
                >
                  <Camera className="w-5 h-5" />
                  <span>Record Video</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative bg-black rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-[300px] object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">Recording</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                      isDark 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white font-semibold`}
                  >
                    <div className="w-4 h-4 bg-white rounded"></div>
                    <span>Stop Recording</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
        Supported formats: MP4, WebM, MOV. Max size: {maxSizeMB}MB
      </p>
    </div>
  );
}

