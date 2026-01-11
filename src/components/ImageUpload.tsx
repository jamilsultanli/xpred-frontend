import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { uploadApi } from '../lib/api/upload';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  type?: 'avatar' | 'banner' | 'post';
  maxSizeMB?: number;
  className?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  label = 'Upload Image',
  type = 'post',
  maxSizeMB = 5,
  className = ''
}: ImageUploadProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Image size must be less than ${maxSizeMB}MB`);
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
      const response = await uploadApi.uploadImage(file);
      if (response.success && response.url) {
        onChange(response.url);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className={`w-full rounded-xl object-cover ${
                type === 'avatar' ? 'h-32 w-32 rounded-full' : 
                type === 'banner' ? 'h-48' : 'h-64'
              }`}
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDark 
                ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            ) : (
              <>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click to upload image
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Max size: {maxSizeMB}MB
                </p>
              </>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}

