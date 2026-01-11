import { useState } from 'react';
import { X, Image, Video, TrendingUp, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { MediaType } from '../types';
import { predictionsApi } from '../lib/api/predictions';
import { ImageUpload } from './ImageUpload';
import { VideoUpload } from './VideoUpload';
import { toast } from 'sonner';

interface CreatePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPredictionCreated?: (prediction: any) => void;
}

export function CreatePredictionModal({ isOpen, onClose, onPredictionCreated }: CreatePredictionModalProps) {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    category: 'Tech',
    endDate: '',
    mediaUrl: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!formData.question.trim() || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Show uploading status
    const uploadingToast = toast.loading('Creating prediction...', {
      description: 'Validating and uploading your content',
    });
    
    try {
      const deadline = new Date(formData.endDate).toISOString();

      const response = await predictionsApi.createPrediction({
        question: formData.question.trim(),
        description: formData.description.trim() || undefined,
        deadline,
        category: formData.category,
        market_image: mediaType === 'photo' && formData.mediaUrl ? formData.mediaUrl : undefined,
        market_video: mediaType === 'video' && formData.mediaUrl ? formData.mediaUrl : undefined,
        initial_pot_xp: 0,
      });

      if (response.success) {
        // Dismiss uploading toast
        toast.dismiss(uploadingToast);
        
        // Show success with grammar info
        if (response.ai_analysis?.grammarFixed) {
          toast.success('Prediction shared!', {
            description: 'Grammar was automatically corrected',
            duration: 3000,
          });
        } else {
          toast.success('Prediction shared successfully!', {
            duration: 3000,
          });
        }
        
        // Call the callback to add prediction to feed without refresh
        if (onPredictionCreated && response.prediction) {
          onPredictionCreated(response.prediction);
        }
        
        onClose();
        setStep(1);
        setFormData({
          question: '',
          description: '',
          category: 'Tech',
          endDate: '',
          mediaUrl: '',
        });
      } else {
        toast.dismiss(uploadingToast);
        toast.error('Failed to share prediction');
      }
    } catch (error: any) {
      toast.dismiss(uploadingToast);
      
      // Check if it's a validation error with violations
      if (error.status === 400 || error.response?.status === 400) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        if (errorMessage.includes('violates platform policies') || errorMessage.includes('flagged as unsafe')) {
          toast.error('Content Policy Violation', { 
            description: errorMessage,
            duration: 8000 
          });
        } else if (errorMessage.includes('mentions') && errorMessage.includes('deadline')) {
          // Deadline conflict error
          toast.error('Deadline Conflict', {
            description: errorMessage,
            duration: 8000,
          });
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('An error occurred', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
        <div className={`${isDark ? 'bg-[#16181c]' : 'bg-white'} border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <h2 className="text-xl font-bold">Create Prediction</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= s 
                    ? 'bg-blue-500 text-white' 
                    : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>

          {/* Step 1: Media Type */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Choose Post Type</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setMediaType('text')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    mediaType === 'text'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${mediaType === 'text' ? 'text-blue-500' : ''}`} />
                  <div className="font-bold">Text</div>
                </button>
                <button
                  onClick={() => setMediaType('photo')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    mediaType === 'photo'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image className={`w-8 h-8 mx-auto mb-2 ${mediaType === 'photo' ? 'text-blue-500' : ''}`} />
                  <div className="font-bold">Photo</div>
                </button>
                <button
                  onClick={() => setMediaType('video')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    mediaType === 'video'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video className={`w-8 h-8 mx-auto mb-2 ${mediaType === 'video' ? 'text-blue-500' : ''}`} />
                  <div className="font-bold">Video</div>
                </button>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Question & Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Prediction Details</h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Question *
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                  placeholder="Will Bitcoin reach $200k by end of 2026?"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Add more context to your prediction..."
                />
              </div>

              {mediaType !== 'text' && (
                <div>
                  {mediaType === 'photo' ? (
                    <ImageUpload
                      value={formData.mediaUrl}
                      onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                      label="Upload Photo"
                      type="post"
                      maxSizeMB={5}
                    />
                  ) : (
                    <VideoUpload
                      value={formData.mediaUrl}
                      onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                      label="Upload or Record Video"
                      maxSizeMB={100}
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <option value="Tech">Tech</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Sports">Sports</option>
                    <option value="Politics">Politics</option>
                    <option value="World">World</option>
                    <option value="Culture">Culture</option>
                    <option value="Finance">Finance</option>
                    <option value="E-Gaming">E-Gaming</option>
                    <option value="Geopolitics">Geopolitics</option>
                    <option value="Startups">Startups</option>
                    <option value="Music">Music</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sharing...
                    </span>
                  ) : (
                    'Share'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
