import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { resolutionsApi } from '../lib/api/resolutions';
import { ArrowLeft, AlertCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResolutionCenterProps {
  onBack: () => void;
}

export function ResolutionCenter({ onBack }: ResolutionCenterProps) {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, underReview: 0 });
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [proposedOutcome, setProposedOutcome] = useState<boolean>(true);
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPendingResolutions();
  }, []);

  const loadPendingResolutions = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await resolutionsApi.getPendingResolutions();
      if (response.success) {
        setPredictions(response.predictions);
        setCounts(response.counts);
      }
    } catch (error: any) {
      toast.error('Failed to load pending resolutions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPrediction) return;
    if (!proofUrl.trim()) {
      toast.error('Please provide proof (URL or image link)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resolutionsApi.submitResolution(selectedPrediction.id, {
        proposed_outcome: proposedOutcome,
        evidence: proofUrl,
        notes,
      });

      if (response.success) {
        toast.success('Resolution submitted for review!');
        setSelectedPrediction(null);
        setProofUrl('');
        setNotes('');
        loadPendingResolutions();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit resolution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} p-4 flex items-center gap-4`}>
        <button
          onClick={onBack}
          className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Resolution Center</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Finalize your expired predictions
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">All caught up!</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
            You have no expired predictions awaiting resolution.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{counts.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Expired</div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <div className="text-2xl font-bold text-red-500">{counts.pending}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Need Action</div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
              <div className="text-2xl font-bold text-yellow-500">{counts.underReview}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Under Review</div>
            </div>
          </div>

          {/* Predictions List */}
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
                } ${selectedPrediction?.id === prediction.id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{prediction.question}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Expired: {new Date(prediction.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    {prediction.resolution_status === 'pending' ? (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                        Needs Action
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        Under Review
                      </span>
                    )}
                  </div>
                </div>

                {prediction.resolution_status === 'pending' && selectedPrediction?.id !== prediction.id && (
                  <button
                    onClick={() => setSelectedPrediction(prediction)}
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Submit Resolution
                  </button>
                )}

                {selectedPrediction?.id === prediction.id && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">What was the outcome?</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setProposedOutcome(true)}
                          className={`py-3 px-4 rounded-lg font-bold ${
                            proposedOutcome
                              ? 'bg-green-500 text-white'
                              : isDark
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setProposedOutcome(false)}
                          className={`py-3 px-4 rounded-lg font-bold ${
                            !proposedOutcome
                              ? 'bg-red-500 text-white'
                              : isDark
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Proof (URL or Image Link) *</label>
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://example.com/proof or image URL"
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                        Provide a link to evidence (news article, official statement, etc.)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional context..."
                        rows={3}
                        className={`w-full px-4 py-2 rounded-lg ${
                          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !proofUrl.trim()}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPrediction(null);
                          setProofUrl('');
                          setNotes('');
                        }}
                        className={`px-6 py-3 rounded-lg font-bold ${
                          isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {prediction.resolution_status === 'submitted' && (
                  <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          Under Admin Review
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Your proposed outcome: <span className="font-bold">{prediction.proposed_outcome ? 'YES' : 'NO'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

