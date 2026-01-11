import { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api/client';
import { toast } from 'sonner';

interface KYCStatus {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export function KYCPage() {
  const { theme } = useTheme();
  const { isAuthenticated, setShowLoginModal } = useAuth();
  const isDark = theme === 'dark';
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState({
    id_front: null as File | null,
    id_back: null as File | null,
    selfie: null as File | null,
  });
  const [previews, setPreviews] = useState({
    id_front: '',
    id_back: '',
    selfie: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadKYCStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const loadKYCStatus = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/verification/status');
      if (response.success) {
        setKycStatus(response.status || { status: 'not_submitted' });
      }
    } catch (error: any) {
      console.error('Failed to load KYC status:', error);
      setKycStatus({ status: 'not_submitted' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field: keyof typeof documents, file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setDocuments({ ...documents, [field]: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [field]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!documents.id_front || !documents.id_back || !documents.selfie) {
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id_front', documents.id_front);
      formData.append('id_back', documents.id_back);
      formData.append('selfie', documents.selfie);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/verification/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success('KYC verification submitted successfully!');
        await loadKYCStatus();
        // Reset form
        setDocuments({ id_front: null, id_back: null, selfie: null });
        setPreviews({ id_front: '', id_back: '', selfie: '' });
      } else {
        toast.error(data.message || 'Failed to submit KYC verification');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (!kycStatus) return null;
    switch (kycStatus.status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Shield className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!kycStatus) return 'Not Submitted';
    switch (kycStatus.status) {
      case 'approved':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Submitted';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please login to access KYC verification</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-full"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            KYC Verification
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Verify your identity to unlock full platform features
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Status Card */}
            <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6 mb-6`}>
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <div className="text-lg font-bold">Verification Status</div>
                  <div className={`text-sm ${
                    kycStatus?.status === 'approved' ? 'text-green-400' :
                    kycStatus?.status === 'pending' ? 'text-yellow-400' :
                    kycStatus?.status === 'rejected' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {getStatusText()}
                  </div>
                  {kycStatus?.submitted_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Submitted: {new Date(kycStatus.submitted_at).toLocaleDateString()}
                    </div>
                  )}
                  {kycStatus?.rejection_reason && (
                    <div className="text-sm text-red-400 mt-2">
                      Reason: {kycStatus.rejection_reason}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Form */}
            {kycStatus?.status !== 'approved' && (
              <div className={`${isDark ? 'bg-[#16181c] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
                <h2 className="text-xl font-bold mb-4">Submit Documents</h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Please upload clear photos of the following documents:
                </p>

                <div className="space-y-6">
                  {/* ID Front */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Government ID (Front)</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('id_front', e.target.files?.[0] || null)}
                          className="hidden"
                          id="id_front"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="id_front"
                          className={`block w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                            isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <div className="text-sm font-medium">Click to upload</div>
                            <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
                          </div>
                        </label>
                      </div>
                      {previews.id_front && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border">
                          <img src={previews.id_front} alt="ID Front" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ID Back */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Government ID (Back)</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('id_back', e.target.files?.[0] || null)}
                          className="hidden"
                          id="id_back"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="id_back"
                          className={`block w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                            isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <div className="text-sm font-medium">Click to upload</div>
                            <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
                          </div>
                        </label>
                      </div>
                      {previews.id_back && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border">
                          <img src={previews.id_back} alt="ID Back" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selfie */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Selfie with ID</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('selfie', e.target.files?.[0] || null)}
                          className="hidden"
                          id="selfie"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="selfie"
                          className={`block w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                            isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <div className="text-sm font-medium">Click to upload</div>
                            <div className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</div>
                          </div>
                        </label>
                      </div>
                      {previews.selfie && (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border">
                          <img src={previews.selfie} alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !documents.id_front || !documents.id_back || !documents.selfie}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

