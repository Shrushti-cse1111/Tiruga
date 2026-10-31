import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Card, Notice, TopBar } from '../../design/components';
import { useAuth, getAuthErrorMessage } from '../../lib/auth';
import { useAppStore } from '../../lib/store';

export const AuthScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    resetPassword,
    isGuest
  } = useAuth();
  const showToast = useAppStore((s) => s.showToast);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const lang = (i18n.language as 'en' | 'kn' | 'mr') || 'en';

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      showToast(lang === 'kn' ? 'ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!' : lang === 'mr' ? 'यशस्वीरित्या साइन इन केले!' : 'Signed in with Google successfully!');
      navigate('/home');
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err.code || '', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName);
        showToast(
          lang === 'kn'
            ? 'ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ದಯವಿಟ್ಟು ಪರಿಶೀಲನಾ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ.'
            : lang === 'mr'
            ? 'खाते तयार केले! कृपया पडताळणी ईमेल तपासा.'
            : 'Account created! Please check your email for verification.'
        );
      } else {
        await signInWithEmail(email, password);
        showToast(
          lang === 'kn' ? 'ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!' : lang === 'mr' ? 'यशस्वीरित्या साइन इन केले!' : 'Welcome back to Tiruga!'
        );
      }
      navigate('/home');
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err.code || '', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInAsGuest();
      showToast(
        lang === 'kn'
          ? 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯುತ್ತಿದ್ದೀರಿ'
          : lang === 'mr'
          ? 'अतिथी म्हणून सुरू ठेवत आहे'
          : 'Continuing as guest'
      );
      navigate('/start');
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err.code || '', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetSent(true);
      showToast('Password reset link sent to your email');
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err.code || '', lang));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f3] dark:bg-[#0f1614] text-[#15231f] dark:text-[#e8f0ed] flex flex-col justify-between p-4 pb-12">
      <div>
        <TopBar
          title={mode === 'signin' ? t('login') : 'Create Account'}
          onBack={() => navigate('/')}
        />

        <div className="max-w-sm mx-auto w-full pt-4 space-y-5">
          {/* Header Title */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0e5a52]/10 dark:bg-[#5cc4b6]/10 text-[#0e5a52] dark:text-[#5cc4b6] mb-1">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black font-heading">
              {mode === 'signin' ? 'Welcome Back' : 'Join Tiruga'}
            </h1>
            <p className="text-xs text-[#5b6c66] dark:text-[#9cb0aa]">
              {mode === 'signin'
                ? 'Sign in to access your saved Karnataka itineraries'
                : 'Create an account to keep your offline trips across devices'}
            </p>
          </div>

          {/* Segmented Mode Picker */}
          <div className="flex bg-[#dce5e1] dark:bg-[#202e2a] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[44px] ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#141f1c] text-[#0e5a52] dark:text-[#5cc4b6] shadow-xs'
                  : 'text-[#5b6c66] dark:text-[#9cb0aa]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[44px] ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#141f1c] text-[#0e5a52] dark:text-[#5cc4b6] shadow-xs'
                  : 'text-[#5b6c66] dark:text-[#9cb0aa]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-[#fce8e6] border border-[#d93025]/40 text-[#c5221f] dark:bg-[#381614] dark:text-[#f28b82] text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#d93025]" />
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Google One-Click Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#172220] border border-[#dce5e1] dark:border-[#2b3c38] text-[#15231f] dark:text-white rounded-2xl py-3 px-4 min-h-[48px] font-semibold text-sm shadow-xs hover:bg-[#f9faf9] dark:hover:bg-[#1f2d2a] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="h-px bg-[#dce5e1] dark:bg-[#2b3c38] flex-1" />
            <span className="text-[11px] uppercase tracking-wider text-[#5b6c66] dark:text-[#9cb0aa] font-medium">
              or with email
            </span>
            <div className="h-px bg-[#dce5e1] dark:bg-[#2b3c38] flex-1" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold block mb-1 text-[#5b6c66] dark:text-[#9cb0aa]">
                  Your Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-3.5 text-[#5b6c66] dark:text-[#9cb0aa]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Rao"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] bg-white dark:bg-[#141f1c] text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a52] dark:focus:ring-[#5cc4b6] min-h-[48px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold block mb-1 text-[#5b6c66] dark:text-[#9cb0aa]">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-[#5b6c66] dark:text-[#9cb0aa]" />
                <input
                  type="email"
                  required
                  placeholder="traveler@karnataka.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] bg-white dark:bg-[#141f1c] text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a52] dark:focus:ring-[#5cc4b6] min-h-[48px]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#5b6c66] dark:text-[#9cb0aa]">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setShowForgot(true); setResetEmail(email); }}
                    className="text-xs text-[#0e5a52] dark:text-[#5cc4b6] font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-[#5b6c66] dark:text-[#9cb0aa]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] bg-white dark:bg-[#141f1c] text-sm focus:outline-none focus:ring-2 focus:ring-[#0e5a52] dark:focus:ring-[#5cc4b6] min-h-[48px]"
                />
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-bold shadow-sm"
            >
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account & Continue'}
            </Button>
          </form>

          {/* Guest fallback button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGuestAuth}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-dashed border-[#5b6c66]/40 text-[#5b6c66] dark:text-[#9cb0aa] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.99] transition-all"
            >
              <span>Continue as guest (No password needed)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div
          role="dialog"
          aria-label="Forgot Password"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-[#172220] text-[#15231f] dark:text-[#e8f0ed] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-heading">Reset Password</h3>
            <p className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] leading-relaxed">
              Enter your email address and we will send you a link to reset your password.
            </p>

            {resetSent ? (
              <div className="p-3.5 rounded-2xl bg-[#e6f4ea] text-[#137333] dark:bg-[#14321d] dark:text-[#81c995] text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Reset link sent! Check your inbox or spam folder.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="traveler@karnataka.in"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] bg-[#f4f7f3] dark:bg-[#141f1c] text-sm"
                />
                <Button variant="primary" type="submit" disabled={resetLoading} className="w-full">
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <Button
              variant="text"
              type="button"
              onClick={() => { setShowForgot(false); setResetSent(false); }}
              className="w-full text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
