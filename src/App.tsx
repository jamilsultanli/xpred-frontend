import { Toaster } from 'sonner';
import { Routes, Route, useLocation, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileNav } from './components/MobileNav';
import { Sidebar } from './components/Sidebar';
import { TrendingSidebar } from './components/TrendingSidebar';
import { PredictionFeed } from './components/PredictionFeed';
import { ExplorePage } from './components/ExplorePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { MessagesPage } from './components/MessagesPage';
import { CommunityPage } from './components/CommunityPage';
import { CommunityDetailPage } from './components/CommunityDetailPage';
import { UserProfilePage } from './components/UserProfilePage';
import { NotificationsPage } from './components/NotificationsPage';
import { BookmarksPage } from './components/BookmarksPage';
import { SettingsPage } from './components/SettingsPage';
import { WalletPage } from './components/WalletPage';
import { XPMarketPage } from './components/XPMarketPage';
import { FollowersPage } from './components/FollowersPage';
import { FollowingPage } from './components/FollowingPage';
import { AllActivePredictionsPage } from './components/AllActivePredictionsPage';
import { PredictionDetailPage } from './components/PredictionDetailPage';
import { LoginModal } from './components/LoginModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { CreatePredictionModal } from './components/CreatePredictionModal';
import { useAuth } from './contexts/AuthContext';
import { SEO } from './components/SEO';
import { HelpPage } from './components/HelpPage';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { DisclaimerPage } from './components/DisclaimerPage';
import { AMLPolicyPage } from './components/AMLPolicyPage';
import { KYCPolicyPage } from './components/KYCPolicyPage';
import { SweepstakePolicyPage } from './components/SweepstakePolicyPage';
import { NotFoundPage } from './components/NotFoundPage';
import { ResolutionCenter } from './components/ResolutionCenter';
import { ResolutionNoticeBar } from './components/ResolutionNoticeBar';
import { SharePredictionComposer } from './components/SharePredictionComposer';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminUserDetails from './components/admin/AdminUserDetails';
import ResolutionQueue from './components/admin/ResolutionQueue';
import AdminPredictions from './components/admin/AdminPredictions';
import AdminReports from './components/admin/AdminReports';
import AdminKYC from './components/admin/AdminKYC';
import AdminSupport from './components/admin/AdminSupport';
import AdminFinance from './components/admin/AdminFinance';
import AdminSettings from './components/admin/AdminSettings';
import AuditLogs from './components/admin/AuditLogs';
import BroadcastMessage from './components/admin/BroadcastMessage';

const pageSEO: Record<string, { title: string; description: string }> = {
  '/': { title: 'Xpred - Predict the Future, Win Rewards', description: 'Join Xpred to make predictions on technology, crypto, sports, and more. Win XP and XC rewards for accurate predictions.' },
  '/explore': { title: 'Explore Predictions - Xpred', description: 'Discover trending predictions across all categories. Explore technology, crypto, sports, politics, and more.' },
  '/leaderboard': { title: 'Leaderboard - Xpred', description: 'See the top predictors on Xpred. Compete for the highest XP and win rates.' },
  '/messages': { title: 'Messages - Xpred', description: 'Connect with other predictors on Xpred through direct messages.' },
  '/communities': { title: 'Communities - Xpred', description: 'Join communities of like-minded predictors. Share insights and predictions.' },
  '/notifications': { title: 'Notifications - Xpred', description: 'Stay updated with your notifications on Xpred.' },
  '/bookmarks': { title: 'Bookmarks - Xpred', description: 'View your bookmarked predictions on Xpred.' },
  '/settings': { title: 'Settings - Xpred', description: 'Manage your account settings and preferences on Xpred.' },
  '/wallet': { title: 'Wallet - Xpred', description: 'Manage your XP and XC balance, purchase bundles, and view transaction history.' },
  '/xp-market': { title: 'XP Market - Xpred', description: 'Purchase titles, avatar frames, and badges with your XP.' },
  '/active-predictions': { title: 'All Active Predictions - Xpred', description: 'View all your active predictions on Xpred.' },
};

// Dynamic route components
function ProfileRoute() {
  const { username } = useParams<{ username: string }>();
  return <UserProfilePage username={username || ''} />;
}

function FollowersRoute() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const navigateToProfile = (username: string) => {
    navigate(`/user/${username}`);
  };
  return <FollowersPage username={username || ''} onProfileClick={navigateToProfile} />;
}

function FollowingRoute() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const navigateToProfile = (username: string) => {
    navigate(`/user/${username}`);
  };
  return <FollowingPage username={username || ''} onProfileClick={navigateToProfile} />;
}

function ExplorePageWrapper() {
  const navigate = useNavigate();
  return <ExplorePage onProfileClick={(username) => navigate(`/user/${username}`)} />;
}

function LeaderboardPageWrapper() {
  const navigate = useNavigate();
  return <LeaderboardPage onProfileClick={(username) => navigate(`/user/${username}`)} />;
}

function NotificationsPageWrapper() {
  const navigate = useNavigate();
  return <NotificationsPage onProfileClick={(username) => navigate(`/user/${username}`)} />;
}

function BookmarksPageWrapper() {
  const navigate = useNavigate();
  return <BookmarksPage onProfileClick={(username) => navigate(`/user/${username}`)} />;
}

function AllActivePredictionsPageWrapper() {
  const navigate = useNavigate();
  return <AllActivePredictionsPage onBack={() => navigate('/')} />;
}

function ResolutionCenterWrapper() {
  const navigate = useNavigate();
  return <ResolutionCenter onBack={() => navigate('/')} />;
}

function HomePage({ newPrediction, onCreateClick }: { newPrediction?: any; onCreateClick: () => void }) {
  const { isAuthenticated, setShowLoginModal, userData } = useAuth();
  const navigate = useNavigate();

  const navigateToProfile = (username: string) => {
    navigate(`/user/${username}`);
  };

  return (
    <>
      {isAuthenticated && (
        <SharePredictionComposer
          isAuthenticated={isAuthenticated}
          avatarUrl={userData?.avatar}
          displayName={userData?.name}
          username={userData?.username}
          onCompose={onCreateClick}
        />
      )}
      <PredictionFeed 
        onProfileClick={navigateToProfile} 
        newPrediction={newPrediction}
      />
    </>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPrediction, setNewPrediction] = useState<any>(null);

  // Get SEO data for current route
  const seoData = pageSEO[location.pathname] || pageSEO['/'];

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handlePredictionCreated = (prediction: any) => {
    setNewPrediction(prediction);
  };

  // Update SEO on route change
  useEffect(() => {
    const path = location.pathname;
    let title = seoData.title;
    let description = seoData.description;
    
    // Handle dynamic routes
    if (path.startsWith('/user/')) {
      const username = path.split('/user/')[1]?.split('/')[0];
      if (username) {
        title = `${username} - Profile | Xpred`;
        description = `View ${username}'s profile, predictions, and statistics on Xpred.`;
      }
    } else if (path.startsWith('/user/') && path.includes('/followers')) {
      const username = path.split('/user/')[1]?.split('/followers')[0];
      if (username) {
        title = `${username}'s Followers - Xpred`;
        description = `View ${username}'s followers on Xpred.`;
      }
    } else if (path.startsWith('/user/') && path.includes('/following')) {
      const username = path.split('/user/')[1]?.split('/following')[0];
      if (username) {
        title = `${username}'s Following - Xpred`;
        description = `View users that ${username} is following on Xpred.`;
      }
    }

    document.title = title;
  }, [location.pathname, seoData]);

  const getCurrentPage = () => {
    const path = location.pathname;
    // Skip for admin panel
    if (path.startsWith('/admin')) return 'admin';
    if (path === '/') return 'home';
    if (path.startsWith('/user/')) return 'profile';
    return path.slice(1).split('/')[0] as any;
  };

  // Render admin panel separately without main layout
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="predictions" element={<AdminPredictions />} />
          <Route path="resolution-queue" element={<ResolutionQueue />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="kyc" element={<AdminKYC />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="broadcast" element={<BroadcastMessage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white'}`}>
      <SEO 
        title={seoData.title} 
        description={seoData.description}
        url={`https://xpred.com${location.pathname}`}
      />
      <Toaster 
        position="top-center" 
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1f2937' : '#ffffff',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
      
      {/* Desktop Header - Sticky */}
      <div className="hidden lg:block sticky top-0 z-50">
        <Header onCreateClick={() => setShowCreateModal(true)} />
      </div>
      
      {/* Mobile Header */}
      <div className="lg:hidden">
        <MobileHeader onCreateClick={() => setShowCreateModal(true)} />
      </div>
      
      {/* Resolution Notice Bar - only show on feed pages */}
      {(location.pathname === '/' || location.pathname === '/explore') && <ResolutionNoticeBar />}
      
      <div className="flex flex-1 max-w-[1280px] mx-auto w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar onCreateClick={() => setShowCreateModal(true)} />
        </div>
        
        {/* Main Content - Scrollable */}
        <main className={`flex-1 lg:border-x overflow-y-auto ${theme === 'light' ? 'lg:border-gray-200' : 'lg:border-gray-800'} pb-16 lg:pb-0`}>
          <Routes>
            <Route path="/" element={<HomePage newPrediction={newPrediction} onCreateClick={() => setShowCreateModal(true)} />} />
            <Route path="/explore" element={<ExplorePageWrapper />} />
            <Route path="/leaderboard" element={<LeaderboardPageWrapper />} />
            <Route path="/messages" element={<MessagesPage />} />
                <Route path="/communities" element={<CommunityPage />} />
                <Route path="/communities/:id" element={<CommunityDetailPage />} />
            <Route path="/user/:username" element={<ProfileRoute />} />
            <Route path="/user/:username/followers" element={<FollowersRoute />} />
            <Route path="/user/:username/following" element={<FollowingRoute />} />
            <Route path="/prediction/:id/:slug?" element={<PredictionDetailPage />} />
            <Route path="/notifications" element={<NotificationsPageWrapper />} />
            <Route path="/bookmarks" element={<BookmarksPageWrapper />} />
            <Route path="/settings" element={<SettingsPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/xp-market" element={<XPMarketPage />} />
                <Route path="/active-predictions" element={<AllActivePredictionsPageWrapper />} />
                <Route path="/resolution-center" element={<ResolutionCenterWrapper />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<HelpPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/aml-policy" element={<AMLPolicyPage />} />
                <Route path="/kyc-policy" element={<KYCPolicyPage />} />
                <Route path="/sweepstake-policy" element={<SweepstakePolicyPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/aml-policy" element={<AMLPolicyPage />} />
                <Route path="/kyc-policy" element={<KYCPolicyPage />} />
                <Route path="/sweepstake-policy" element={<SweepstakePolicyPage />} />
                
                <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        
        {/* Desktop Right Sidebar */}
        <div className="hidden xl:block">
          {location.pathname !== '/messages' && <TrendingSidebar />}
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileNav onCreateClick={() => setShowCreateModal(true)} />
      </div>
      
      <LoginModal />
      <OnboardingFlow />
      <CreatePredictionModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onPredictionCreated={handlePredictionCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
