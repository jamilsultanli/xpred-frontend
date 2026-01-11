import { useState } from 'react';
import { X, Flag, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { reportsApi } from '../lib/api/reports';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'prediction' | 'user' | 'comment';
  entityId: string;
  entityName?: string;
}

const reportReasons = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Bullying' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'false_information', label: 'False Information' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ isOpen, onClose, entityType, entityId, entityName }: ReportModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reportsApi.createReport({
        entity_type: entityType,
        entity_id: entityId,
        reason: selectedReason,
        details: additionalDetails.trim() || undefined,
      });

      if (response.success) {
        toast.success('Report submitted. Thank you for your feedback.');
        onClose();
        // Reset form
        setSelectedReason('');
        setAdditionalDetails('');
      } else {
        toast.error(response.message || 'Failed to submit report');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'}`}>
        <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            <h2 className="text-xl font-bold">Report {entityType === 'prediction' ? 'Prediction' : entityType === 'user' ? 'User' : 'Comment'}</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {entityName && (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Reporting: <span className="font-semibold">{entityName}</span>
            </p>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason for reporting *
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? isDark ? 'bg-blue-500/20 border-blue-500' : 'bg-blue-50 border-blue-500'
                      : isDark ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-200'
                  } border`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Additional Details (Optional)
            </label>
            <textarea
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
              }`}
              rows={4}
              placeholder="Provide more details about your report..."
              maxLength={500}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {additionalDetails.length}/500
            </p>
          </div>
        </div>

        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} p-6 flex gap-3`}>
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
              isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

