import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabBar, Toast } from './design/components';
import { SplashScreen } from './features/splash/SplashScreen';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { TripPlanScreen } from './features/plan/TripPlanScreen';
import { TravelScreen } from './features/travel/TravelScreen';
import { PlanBScreen } from './features/planb/PlanBScreen';
import { SavedScreen } from './features/saved/SavedScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { AuthScreen } from './features/auth/AuthScreen';
import { AdminScreen } from './features/admin/AdminScreen';
import { TripPrintScreen } from './features/print/TripPrintScreen';
import { AssistantSheet } from './features/assistant/AssistantSheet';
import { DemoToolsPanel } from './components/common/DemoToolsPanel';
import { LoadingSkeleton } from './components/common/CommonComponents';
import { AuthProvider, useAuth } from './lib/auth';
import { initAndSeedDatabase } from './lib/db';
import { useOnlineStatus } from './lib/useOnlineStatus';
import { LanguageProvider } from './lib/languageContext';
import { WifiOff, Check } from 'lucide-react';
import './lib/i18n';

// Lazy load heavy screens for rapid first paint
const NearbyScreen = lazy(() =>
  import('./features/nearby/NearbyScreen').then((m) => ({ default: m.NearbyScreen }))
);
const KannadaCompanionScreen = lazy(() =>
  import('./features/kannada/KannadaCompanionScreen').then((m) => ({ default: m.KannadaCompanionScreen }))
);
const OfflineScreen = lazy(() =>
  import('./features/offline/OfflineScreen').then((m) => ({ default: m.OfflineScreen }))
);
const DevAiTestScreen = lazy(() =>
  import('./features/dev/DevAiTestScreen').then((m) => ({ default: m.DevAiTestScreen }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    }
  }
});

// Top-Level Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tiruga App Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6EF] flex flex-col items-center justify-center p-6 text-center max-w-[430px] mx-auto select-none">
          <div className="w-16 h-16 rounded-full bg-[#DCEFE5] text-[#103F38] flex items-center justify-center text-2xl font-bold mb-4 shadow-xs">
            🏛️
          </div>
          <h2 className="text-xl font-bold text-[#103F38] mb-2 font-heading">Something went wrong</h2>
          <p className="text-xs text-[#60736E] mb-6 max-w-xs leading-relaxed">
            We encountered an unexpected display issue. Your saved trips and preferences are preserved safely.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/home';
            }}
            className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#103F38] text-white font-bold text-xs shadow-md hover:bg-[#146B5B] transition-colors cursor-pointer"
          >
            Go back home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route Guard component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Guest counts as signed-in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <AdminScreen />;
  }

  return <>{children}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading } = useAuth();
  const isOnline = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = React.useState<boolean>(false);
  const prevOnlineRef = React.useRef<boolean>(isOnline);

  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    initAndSeedDatabase();

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && location.pathname === '/') {
      navigate('/home');
    }
  }, []);

  const isPrint = location.pathname.endsWith('/print') || location.pathname.includes('/print');

  const hideChrome =
    isPrint ||
    location.pathname === '/' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/start' ||
    location.pathname === '/auth';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#103F38] flex flex-col items-center justify-center text-white p-6 select-none">
        <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl mb-4 animate-bounce">
          🏛️
        </div>
        <h2 className="text-2xl font-black font-heading tracking-wide">Tiruga (ತಿರು ಗ)</h2>
        <p className="text-xs text-white/70 mt-1">Connecting to Karnataka Yatri...</p>
      </div>
    );
  }

  // If on printable route, render full-width clean document without mobile frame
  if (isPrint) {
    return (
      <div className="min-h-screen bg-white text-[#18312D]">
        <main className="w-full">
          <Suspense
            fallback={
              <div className="p-8 text-center text-sm font-semibold text-[#103F38]">
                Loading print document...
              </div>
            }
          >
            <Routes>
              <Route path="/trip/:id/print" element={<TripPrintScreen />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    );
  }

  const isSplash = location.pathname === '/';

  return (
    <div
      className={`min-h-screen ${
        isSplash ? 'bg-[#103F38]' : 'bg-[#e9f1ec] dark:bg-[#070b0a]'
      } flex items-center justify-center p-0 sm:p-4 select-none transition-colors duration-300`}
    >
      <div
        className={`w-full sm:max-w-[420px] min-h-screen sm:min-h-[844px] sm:max-h-[920px] ${
          isSplash
            ? 'bg-[#103F38] sm:border-[#092b26]'
            : 'bg-[#f4f7f3] dark:bg-[#0f1614] sm:border-[#15231f] dark:sm:border-[#2b3c38]'
        } sm:rounded-[38px] sm:shadow-2xl sm:border-[8px] flex flex-col relative overflow-x-hidden overflow-y-auto no-scrollbar`}
      >
        {/* Global Slim Offline Banner */}
        {!isOnline && (
          <div className="bg-[#D86D2D] text-white text-xs font-bold px-3 py-1.5 flex items-center justify-center space-x-1.5 z-50 shrink-0 border-b border-amber-300">
            <WifiOff size={13} className="text-[#F4B63E]" />
            <span>You're offline. Showing your downloaded trip.</span>
          </div>
        )}
        {showBackOnline && isOnline && (
          <div className="bg-[#146B5B] text-white text-xs font-bold px-3 py-1.5 flex items-center justify-center space-x-1.5 z-50 shrink-0 animate-fade-in">
            <Check size={13} className="text-[#F4B63E]" />
            <span>Back online</span>
          </div>
        )}
        <main className="flex-1 flex flex-col h-full">
          <Suspense
            fallback={
              <div className="p-4 space-y-4">
                <LoadingSkeleton count={3} />
              </div>
            }
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/auth" element={<AuthScreen />} />

              {/* Protected Routes */}
              <Route
                path="/start"
                element={
                  <RequireAuth>
                    <OnboardingScreen />
                  </RequireAuth>
                }
              />
              <Route path="/plan" element={<TripPlanScreen />} />
              <Route path="/travel-options" element={<TravelScreen />} />
              <Route path="/plan-b" element={<PlanBScreen />} />
              <Route path="/nearby" element={<NearbyScreen />} />
              <Route path="/kannada" element={<KannadaCompanionScreen />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/trip/:id" element={<TripPlanScreen />} />
              <Route path="/trip/:id/travel" element={<TravelScreen />} />
              <Route path="/trip/:id/planb" element={<PlanBScreen />} />
              <Route path="/offline" element={<OfflineScreen />} />
              <Route path="/trip/:id/offline" element={<OfflineScreen />} />
              <Route path="/saved" element={<SavedScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/dev/ai-test" element={<DevAiTestScreen />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminScreen />
                  </RequireAdmin>
                }
              />
              {/* Fallback so deep link refresh never 404s */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global floating Assistant Help button */}
        {!hideChrome && <AssistantSheet />}

        {/* Hackathon Demo Tools Panel (Active via ?demo=1) */}
        <DemoToolsPanel />

        {/* Global bottom Tab Bar */}
        {!hideChrome && <TabBar />}

        {/* Global Toast Notification */}
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
