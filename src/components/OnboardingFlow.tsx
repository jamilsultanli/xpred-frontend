import { useState, useEffect, useCallback } from 'react';
import { X, Check, User, Camera, Sparkles, Users as UsersIcon, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../lib/api/users';
import { socialApi } from '../lib/api/social';
import { toast } from 'sonner';

const categories = [
  { id: 'technology', label: 'Technology', emoji: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'crypto', label: 'Cryptocurrency', emoji: '₿', color: 'from-orange-500 to-yellow-500' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'from-green-500 to-emerald-500' },
  { id: 'politics', label: 'Politics', emoji: '🗳️', color: 'from-red-500 to-rose-500' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: 'from-purple-500 to-pink-500' },
  { id: 'global', label: 'Global Events', emoji: '🌍', color: 'from-teal-500 to-blue-500' },
  { id: 'science', label: 'Science', emoji: '🔬', color: 'from-indigo-500 to-purple-500' },
  { id: 'business', label: 'Business', emoji: '💼', color: 'from-gray-500 to-slate-500' },
];

export function OnboardingFlow() {
  const { theme } = useTheme();
  const { showOnboarding, userData, updateUserData, completeOnboarding } = useAuth();
  const isDark = theme === 'dark';
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [isLoadingSuggestedUsers, setIsLoadingSuggestedUsers] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/6ad6876e-0063-49c9-9841-eceac6501018',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'OnboardingFlow.tsx:37',message:'OnboardingFlow render',data:{showOnboarding,step},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, [showOnboarding, step]);
  // #endregion

  // Fetch suggested users when step 5 is reached
  useEffect(() => {
    if (step === 5 && !isLoadingSuggestedUsers && suggestedUsers.length === 0) {
      fetchSuggestedUsers();
    }
  }, [step]);

  const fetchSuggestedUsers = async () => {
    setIsLoadingSuggestedUsers(true);
    try {
      const response = await usersApi.getSuggestedUsers(selectedInterests, 10);
      if (response.success && response.users) {
        setSuggestedUsers(response.users);
        // Pre-populate followed users based on isFollowing flag
        const alreadyFollowing = response.users
          .filter((user: any) => user.isFollowing)
          .map((user: any) => user.id);
        setFollowedUsers(alreadyFollowing);
      }
    } catch (error: any) {
      console.error('Error fetching suggested users:', error);
      toast.error('Failed to load suggested users');
    } finally {
      setIsLoadingSuggestedUsers(false);
    }
  };

  // Debounced username check - MUST be before early return
  useEffect(() => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setIsUsernameAvailable(null);
      return;
    }

    if (username.length > 15) {
      setUsernameError('Username must be less than 15 characters');
      setIsUsernameAvailable(null);
      return;
    }

    // Check if username matches valid pattern
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      setIsUsernameAvailable(null);
      return;
    }

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError('');
      try {
        const response = await usersApi.checkUsernameAvailability(username);
        if (response.success) {
          if (response.available) {
            setIsUsernameAvailable(true);
            setUsernameError('');
          } else {
            setIsUsernameAvailable(false);
            setUsernameError(response.message || 'Username is already taken');
          }
        } else {
          setIsUsernameAvailable(false);
          setUsernameError('Error checking username');
        }
      } catch (error: any) {
        setIsUsernameAvailable(false);
        setUsernameError(error?.response?.data?.message || 'Error checking username');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
  };

  const handleFollowToggle = async (userId: string) => {
    if (followedUsers.includes(userId)) {
      setFollowedUsers(followedUsers.filter(id => id !== userId));
      // Unfollow via API
      try {
        await socialApi.unfollowUser(userId);
      } catch (error) {
        // Revert on error
        setFollowedUsers([...followedUsers, userId]);
        toast.error('Failed to unfollow user');
      }
    } else {
      setFollowedUsers([...followedUsers, userId]);
      // Follow via API
      try {
        await socialApi.followUser(userId);
      } catch (error) {
        // Revert on error
        setFollowedUsers(followedUsers.filter(id => id !== userId));
        toast.error('Failed to follow user');
      }
    }
  };

  // Fetch suggested users when step 5 is reached
  useEffect(() => {
    if (step === 5 && !isLoadingSuggestedUsers && suggestedUsers.length === 0) {
      fetchSuggestedUsers();
    }
  }, [step]);

  const fetchSuggestedUsers = async () => {
    setIsLoadingSuggestedUsers(true);
    try {
      const response = await usersApi.getSuggestedUsers(selectedInterests, 10);
      if (response.success && response.users) {
        setSuggestedUsers(response.users);
        // Pre-populate followed users based on isFollowing flag
        const alreadyFollowing = response.users
          .filter((user: any) => user.isFollowing)
          .map((user: any) => user.id);
        setFollowedUsers(alreadyFollowing);
      }
    } catch (error: any) {
      console.error('Error fetching suggested users:', error);
      toast.error('Failed to load suggested users');
    } finally {
      setIsLoadingSuggestedUsers(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length === 0) return;
    if (step === 2 && (username.length < 3 || usernameError)) return;
    
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Save onboarding data to backend
      const response = await usersApi.completeOnboarding({
        username: username || undefined,
        bio: bio || undefined,
        avatar_url: avatarUrl || undefined,
        interests: selectedInterests,
        follow_user_ids: followedUsers,
      });

      if (response.success) {
        // Update local user data
        updateUserData({
          username,
          bio,
          avatar: avatarUrl || undefined,
          interests: selectedInterests,
          following: followedUsers,
        });
        
        toast.success('Onboarding completed!');
        completeOnboarding();
      } else {
        toast.error(response.message || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error?.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedInterests.length > 0;
    if (step === 2) return username.length >= 3 && !usernameError && isUsernameAvailable === true;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl ${isDark ? 'bg-[#16181c]' : 'bg-white'} max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to Xpred!</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-2 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Interests */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">What interests you?</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select at least 3 categories to personalize your feed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleInterestToggle(category.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      selectedInterests.includes(category.id)
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                        : isDark 
                        ? 'border-gray-800 hover:border-gray-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedInterests.includes(category.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{category.emoji}</div>
                    <div className="font-bold text-lg">{category.label}</div>
                  </button>
                ))}
              </div>

              <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedInterests.length} selected
                {selectedInterests.length < 3 && ` • Select at least ${3 - selectedInterests.length} more`}
              </div>
            </div>
          )}

          {/* Step 2: Choose Username */}
          {step === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Pick your username</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  This is how others will find you on Xpred
                </p>
              </div>

              <div>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 text-lg focus:outline-none transition-all ${
                      usernameError
                        ? 'border-red-500 focus:border-red-500'
                        : username.length >= 3
                        ? 'border-green-500 focus:border-green-500'
                        : isDark
                        ? 'border-gray-800 focus:border-blue-500 bg-black'
                        : 'border-gray-300 focus:border-blue-500 bg-gray-50'
                    }`}
                    placeholder="username"
                    maxLength={15}
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  )}
                  {!isCheckingUsername && username.length >= 3 && isUsernameAvailable === true && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Check className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                  {!isCheckingUsername && username.length >= 3 && isUsernameAvailable === false && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <X className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                </div>
                {isCheckingUsername ? (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Checking availability...
                  </p>
                ) : usernameError ? (
                  <p className="text-red-500 text-sm mt-2">{usernameError}</p>
                ) : username.length >= 3 && isUsernameAvailable === true ? (
                  <p className="text-green-500 text-sm mt-2">Username is available!</p>
                ) : (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Use only letters, numbers, and underscores
                  </p>
                )}
              </div>

              <div className={`${isDark ? 'bg-black/50' : 'bg-gray-100'} rounded-xl p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className="font-semibold">Tips for a great username:</span>
                </div>
                <ul className={`text-sm space-y-1 ml-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Keep it short and memorable</li>
                  <li>• Make it unique to you</li>
                  <li>• Avoid special characters</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Add Profile Photo */}
          {step === 3 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Add a profile photo</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Help others recognize you
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="w-full">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Photo URL (or skip for now)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-500 transition-all ${
                      isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                    }`}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="grid grid-cols-4 gap-3 w-full">
                  {['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3', 'https://i.pravatar.cc/150?img=4'].map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setAvatarUrl(url)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        avatarUrl === url ? 'border-blue-500 scale-105' : isDark ? 'border-gray-800' : 'border-gray-300'
                      }`}
                    >
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Add Bio */}
          {step === 4 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Tell us about yourself</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Write a short bio (optional)
                </p>
              </div>

              <div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-500 resize-none transition-all ${
                    isDark ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-300'
                  }`}
                  rows={4}
                  maxLength={160}
                  placeholder="🔮 Top Predictor | AI & Tech Enthusiast | 87% Accuracy"
                />
                <div className={`text-sm text-right mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bio.length}/160
                </div>
              </div>

              <div className={`${isDark ? 'bg-black/50' : 'bg-gray-100'} rounded-xl p-4`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                  <strong>Bio examples:</strong>
                </p>
                <div className="space-y-2">
                  {[
                    '🎯 Prediction Expert | Tech & Crypto | 92% Win Rate',
                    '📊 Data-driven predictions | Sports & Markets enthusiast',
                    '🌟 Future forecaster | Science & Global Events'
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setBio(example)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                      }`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Follow Users */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Follow experts</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get predictions from top users in your interests
                </p>
              </div>

              {isLoadingSuggestedUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : suggestedUsers.length > 0 ? (
                <div className="space-y-3">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isDark ? 'border-gray-800 hover:bg-[#1a1a1a]' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img 
                              src={user.avatar_url} 
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-bold">{user.displayName}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              @{user.username}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                              {user.bio} • {user.followers} {user.followers === 1 ? 'follower' : 'followers'} • {user.predictions} predictions
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFollowToggle(user.id)}
                          disabled={isCompleting}
                          className={`px-6 py-2 rounded-full font-bold transition-all ${
                            followedUsers.includes(user.id)
                              ? isDark 
                                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                                : 'bg-gray-200 text-black hover:bg-gray-300'
                              : 'bg-white text-black hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          {followedUsers.includes(user.id) ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No suggested users found. You can skip this step.
                </div>
              )}

              <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {followedUsers.length} user{followedUsers.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
          <button
            onClick={() => step > 1 ? setStep(step - 1) : null}
            disabled={step === 1}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              step === 1
                ? 'opacity-50 cursor-not-allowed'
                : isDark
                ? 'hover:bg-gray-800'
                : 'hover:bg-gray-100'
            }`}
          >
            Back
          </button>

          <div className="flex items-center gap-2">
            {step < totalSteps ? (
              <>
                <button
                  onClick={() => setStep(step + 1)}
                  className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-8 py-2 rounded-full font-bold transition-all ${
                    canProceed()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold transition-all flex items-center gap-2"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
