import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { signInAsGuest, signInWithGoogle } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Hampi stone chariot / Virupaksha temple at golden hour
  const hampiHeroImage =
    'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=85';

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  const handleGuestSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAsGuest();
      navigate('/home');
    } catch (e) {
      console.warn('Guest sign-in note:', e);
      navigate('/home');
    } finally {
      setIsSigningIn(false);
      setShowLoginModal(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (e) {
      console.warn('Google sign-in fallback to guest:', e);
      await signInAsGuest();
      navigate('/home');
    } finally {
      setIsSigningIn(false);
      setShowLoginModal(false);
    }
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden select-none bg-deep-teal">
      {/* 1. Full-Height Karnataka Travel Photography Hero (Hampi at Golden Hour) */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <img
            src={hampiHeroImage}
            alt="Hampi Temple at Golden Hour, Karnataka"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
        ) : (
          /* Guaranteed Deep Teal to Terracotta Fallback Gradient */
          <div className="w-full h-full image-fallback-gradient" />
        )}

        {/* Deep Teal Gradient Overlay Rising from the Bottom for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-teal via-deep-teal/70 to-deep-teal/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-teal/40 via-transparent to-deep-teal/90" />
      </div>

      {/* 2. Top-Center: Tiruga Logo & Kannada Wordmark "ತಿರು ಗ" */}
      <header className="relative z-10 pt-10 sm:pt-12 text-center subtle-fade">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles size={14} className="text-gold" />
          <span>Karnataka Travel Companion</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-lg mb-2">
            <Compass size={28} className="text-gold" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Tiruga
          </h1>
          <span className="text-xl sm:text-2xl font-kannada font-bold text-gold tracking-wide mt-0.5 drop-shadow-sm">
            ತಿರು ಗ
          </span>
        </div>
      </header>

      {/* 3. Bottom Hero Copy, Subtext, and Actions */}
      <footer className="relative z-10 p-6 sm:p-8 pb-10 flex flex-col items-center text-center max-w-[430px] mx-auto w-full subtle-fade">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug drop-shadow-md mb-2">
          Explore Karnataka. Your Way.
        </h2>

        <p className="text-sm sm:text-base text-cream/90 max-w-xs leading-relaxed mb-8 drop-shadow-xs">
          AI powered travel planner for a smarter, safer and richer journey.
        </p>

        {/* Primary Pill Button: "Get Started" (white background, deep-teal text) */}
        <button
          type="button"
          onClick={handleGetStarted}
          className="w-full min-h-[54px] px-8 py-3.5 rounded-full text-lg font-bold shadow-lg transition-all duration-200 cursor-pointer bg-white text-deep-teal hover:bg-mint hover:shadow-xl active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Get Started
        </button>

        {/* Secondary Text Link: "Login" */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="text-sm font-semibold text-cream/80 hover:text-white underline underline-offset-4 py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Login
          </button>
          <span className="text-white/40 text-xs">·</span>
          <button
            type="button"
            onClick={handleGuestSignIn}
            className="text-sm font-medium text-cream/70 hover:text-gold py-2 px-3 rounded-lg transition-colors cursor-pointer"
          >
            Continue as guest
          </button>
        </div>
      </footer>

      {/* Login / Auth Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-text-main shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-mint flex items-center justify-center mx-auto mb-2 text-deep-teal">
                <LogIn size={22} />
              </div>
              <h3 className="font-bold text-xl text-deep-teal">Welcome to Tiruga</h3>
              <p className="text-xs text-muted-text mt-1">
                Sign in to save itineraries across your devices
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full min-h-[48px] rounded-full border border-[#E2DFD3] hover:bg-cream font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isSigningIn}
                className="w-full min-h-[48px] rounded-full bg-deep-teal hover:bg-primary-teal text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserCheck size={18} />
                <span>Continue as guest</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-full py-2.5 text-xs text-muted-text hover:text-text-main font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
