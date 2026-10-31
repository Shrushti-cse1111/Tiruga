import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Settings,
  Bookmark,
  Compass,
  PhoneCall,
  ShieldAlert,
  ChevronRight,
  LogOut,
  LogIn,
  Languages,
  Check,
  X,
  Phone,
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../lib/languageContext';
import { getPreferences, savePreferences, TirugaPreferences } from '../../lib/preferences';
import { getHealth } from '../../lib/api';
import { listTrips, listSavedPlaces } from '../../lib/db';
import {
  Button,
  Card,
  Chip,
  BottomNav
} from '../../components/common/CommonComponents';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Stats
  const [savedTripsCount, setSavedTripsCount] = useState<number>(1);
  const [savedPlacesCount, setSavedPlacesCount] = useState<number>(2);

  // Sheets state
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isProfileDetailsOpen, setIsProfileDetailsOpen] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Preferences form state
  const [prefs, setPrefs] = useState<TirugaPreferences>(getPreferences());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [serverConnected, setServerConnected] = useState<boolean>(false);

  useEffect(() => {
    // Count saved trips and places from db.ts
    listTrips(user?.uid)
      .then((trips) => {
        if (Array.isArray(trips)) setSavedTripsCount(trips.length);
      })
      .catch(() => {});

    listSavedPlaces(user?.uid)
      .then((places) => {
        if (Array.isArray(places)) setSavedPlacesCount(places.length);
      })
      .catch(() => {});

    if (import.meta.env.DEV) {
      getHealth().then((res) => {
        if (res.ok) {
          setServerConnected(true);
        }
      }).catch(() => {});
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePreferences = async () => {
    await savePreferences(prefs, user?.uid);
    setIsPreferencesOpen(false);
    showToast('Travel preferences saved!');
  };

  const handleGoogleSignInStub = async () => {
    // TODO: replace with server call / signInWithPopup
    showToast('Redirecting to Google sign in...');
    navigate('/auth');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'KA';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-deep-teal text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center space-x-2 animate-fade-in border border-white/20">
          <Check size={14} className="text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal">
              {t('profile.title')}
            </h1>
            <p className="text-xs text-muted-text">Traveller profile & settings</p>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileDetailsOpen(true)}
            aria-label="Settings"
            className="w-10 h-10 rounded-full bg-white border border-[#E2DFD3] flex items-center justify-center text-text-main hover:bg-[#F0ECE1] transition-colors cursor-pointer"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* 1. Profile Summary Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E2DFD3] shadow-xs space-y-4">
          <div className="flex items-center space-x-3.5">
            {/* Avatar / Initials */}
            <div className="w-14 h-14 rounded-2xl bg-mint text-deep-teal flex items-center justify-center font-extrabold text-lg border-2 border-primary-teal/30 shadow-xs">
              {getInitials(user?.displayName || 'Karnataka Yatri')}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-text-main truncate">
                {user?.displayName || (isGuest ? 'Guest Traveller' : 'Karnataka Yatri')}
              </h2>
              <p className="text-xs text-muted-text mt-0.5">
                {prefs.travelStyle} Traveller · Hampi Route
              </p>
            </div>
            {isGuest && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                Guest
              </span>
            )}
          </div>

          {/* Three Stat Tiles */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0ECE1]">
            <div
              onClick={() => navigate('/saved')}
              className="bg-cream/60 p-2.5 rounded-2xl border border-[#E2DFD3] text-center cursor-pointer hover:border-primary-teal transition-colors"
            >
              <span className="text-sm font-extrabold text-deep-teal block">
                {savedTripsCount}
              </span>
              <span className="text-[10px] text-muted-text">Saved Trips</span>
            </div>

            <div
              onClick={() => navigate('/saved')}
              className="bg-cream/60 p-2.5 rounded-2xl border border-[#E2DFD3] text-center cursor-pointer hover:border-primary-teal transition-colors"
            >
              <span className="text-sm font-extrabold text-deep-teal block">
                {savedPlacesCount}
              </span>
              <span className="text-[10px] text-muted-text">Places Saved</span>
            </div>

            <div className="bg-cream/60 p-2.5 rounded-2xl border border-[#E2DFD3] text-center">
              <span className="text-sm font-extrabold text-deep-teal block">1</span>
              <span className="text-[10px] text-muted-text">Trip History</span>
            </div>
          </div>
        </div>

        {/* 4. Language Preference Control */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
              <Languages size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-text-main">{t('profile.language')}</div>
              <div className="text-[10px] text-muted-text">Interface translations</div>
            </div>
          </div>

          <div className="flex bg-[#EFECE2] p-1 rounded-full text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-1 px-3 rounded-full font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-deep-teal text-white shadow-xs' : 'text-muted-text'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('kn')}
              className={`py-1 px-3 rounded-full font-bold font-kannada transition-all cursor-pointer ${
                language === 'kn' ? 'bg-deep-teal text-white shadow-xs' : 'text-muted-text'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </div>

        {/* 2. Menu Rows */}
        <div className="bg-white rounded-3xl border border-[#E2DFD3] shadow-xs overflow-hidden divide-y divide-[#F0ECE1]">
          {/* Row 1: My Profile */}
          <button
            type="button"
            onClick={() => setIsProfileDetailsOpen(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <UserIcon size={16} />
              </div>
              <span className="text-xs font-bold text-text-main">My Profile</span>
            </div>
            <ChevronRight size={16} className="text-muted-text" />
          </button>

          {/* Row 2: Travel Preferences */}
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <Compass size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-main">Travel Preferences</span>
                <span className="text-[10px] text-muted-text block">
                  {prefs.interests.join(', ')} · {prefs.budget}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-text" />
          </button>

          {/* Row 3: Saved Places */}
          <button
            type="button"
            onClick={() => navigate('/saved')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <Bookmark size={16} />
              </div>
              <span className="text-xs font-bold text-text-main">Saved Places & Trips</span>
            </div>
            <ChevronRight size={16} className="text-muted-text" />
          </button>

          {/* Row 4: Emergency Access */}
          <button
            type="button"
            onClick={() => setIsEmergencyOpen(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F9F7F1] transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center">
                <ShieldAlert size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-text-main">Emergency Access</span>
                <span className="text-[10px] text-terracotta font-medium block">
                  112 Unified Emergency
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-text" />
          </button>
        </div>

        {/* 6. Logout / Sign in Button */}
        <div className="pt-2">
          {isGuest || !user ? (
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={handleGoogleSignInStub}
            >
              <LogIn size={16} className="mr-2" />
              <span>Sign in with Google</span>
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full min-h-[48px] rounded-full border border-terracotta/30 bg-terracotta/5 hover:bg-terracotta/10 text-terracotta font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>{t('profile.logout')}</span>
            </button>
          )}
        </div>

        {/* Dev-only server status indicator */}
        {import.meta.env.DEV && serverConnected && (
          <div className="text-[10px] text-muted-text text-center font-mono opacity-60 pt-1">
            Server: connected
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Travel Preferences Sheet */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] p-5 space-y-4 shadow-2xl border border-[#E2DFD3] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <h3 className="font-bold text-base text-text-main">Edit Travel Preferences</h3>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interests Multi-Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Interests</label>
              <div className="flex flex-wrap gap-2">
                {['Heritage', 'Nature', 'Food', 'Adventure', 'Beaches', 'Culture'].map((interest) => {
                  const isSelected = prefs.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? prefs.interests.filter((i) => i !== interest)
                          : [...prefs.interests, interest];
                        setPrefs({ ...prefs, interests: next });
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-deep-teal text-white border-deep-teal shadow-2xs'
                          : 'bg-white text-muted-text border-[#E2DFD3]'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Travel Style</label>
              <div className="grid grid-cols-2 gap-2">
                {['Solo', 'Family', 'Romance', 'Friends'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, travelStyle: style })}
                    className={`py-2 px-3 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      prefs.travelStyle === style
                        ? 'bg-mint text-deep-teal border-primary-teal font-bold'
                        : 'bg-white text-muted-text border-[#E2DFD3]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-main">Budget Range</label>
              <div className="space-y-1.5 text-xs">
                {['Under ₹3,000', '₹3,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, budget: b })}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      prefs.budget === b
                        ? 'bg-mint text-deep-teal border-primary-teal font-bold'
                        : 'bg-white text-muted-text border-[#E2DFD3]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Emergency Access Sheet */}
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl border border-[#E2DFD3]">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-terracotta flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">Emergency Access</h3>
                  <p className="text-[10px] text-muted-text">Verified Karnataka traveller hotlines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmergencyOpen(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* List with Verify Locally note */}
            <div className="space-y-2.5">
              {/* Row 1: 112 Unified Emergency Number */}
              <div className="bg-[#FAF3E9] p-3.5 rounded-2xl border border-terracotta/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-extrabold text-terracotta font-mono">112</span>
                    <span className="text-[10px] font-bold bg-terracotta text-white px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-bold text-text-main mt-0.5">
                    India's Unified Emergency Number
                  </p>
                  <p className="text-[10px] text-muted-text">Police, Fire & Ambulance response</p>
                </div>

                <a
                  href="tel:112"
                  className="px-4 py-2 rounded-full bg-terracotta hover:bg-terracotta/90 text-white font-bold text-xs flex items-center space-x-1 shadow-xs"
                >
                  <PhoneCall size={14} />
                  <span>Call 112</span>
                </a>
              </div>

              {/* Generic Row 2: Local Police */}
              <div className="bg-cream/60 p-3 rounded-2xl border border-[#E2DFD3] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-main">Local Police Station</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">Check the number locally</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-gold/30 px-2 py-1 rounded-full border border-gold/40">
                  Verify locally
                </span>
              </div>

              {/* Generic Row 3: Ambulance & First Aid */}
              <div className="bg-cream/60 p-3 rounded-2xl border border-[#E2DFD3] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-main">Ambulance & District Hospital</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">Check the number locally</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-gold/30 px-2 py-1 rounded-full border border-gold/40">
                  Verify locally
                </span>
              </div>

              {/* Generic Row 4: Tourist Helpline */}
              <div className="bg-cream/60 p-3 rounded-2xl border border-[#E2DFD3] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-text-main">Tourist Police / KSTDC Information</h4>
                  <p className="text-[10px] text-muted-text mt-0.5">Check the number locally</p>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 bg-gold/30 px-2 py-1 rounded-full border border-gold/40">
                  Verify locally
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="white"
                fullWidth
                size="md"
                onClick={() => setIsEmergencyOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Details Sheet */}
      {isProfileDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl border border-[#E2DFD3]">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
              <h3 className="font-bold text-base text-text-main">Account Details</h3>
              <button
                type="button"
                onClick={() => setIsProfileDetailsOpen(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-cream rounded-xl border border-[#E2DFD3]">
                <span className="text-[10px] text-muted-text block">UID / Account ID</span>
                <span className="font-mono font-bold text-text-main">
                  {user?.uid || 'guest-session-local'}
                </span>
              </div>
              <div className="p-3 bg-cream rounded-xl border border-[#E2DFD3]">
                <span className="text-[10px] text-muted-text block">Auth Status</span>
                <span className="font-semibold text-text-main">
                  {isGuest ? 'Guest (Local Session)' : 'Signed In User'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => setIsProfileDetailsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Sheet */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl border border-[#E2DFD3]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-terracotta flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-bold text-base text-text-main">Sign Out?</h3>
            </div>

            <p className="text-xs text-muted-text leading-relaxed">
              Are you sure you want to sign out of Tiruga? Your locally saved trips and offline caches will remain on this device.
            </p>

            <div className="flex space-x-3 pt-2">
              <Button
                variant="white"
                className="flex-1 text-xs"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs bg-terracotta hover:bg-terracotta/90 border-terracotta text-white"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                  showToast('Signed out successfully.');
                  navigate('/');
                }}
              >
                Confirm Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
