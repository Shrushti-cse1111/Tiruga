import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  TreePine,
  Landmark,
  Utensils,
  Mountain,
  Palmtree,
  Palette,
  Calendar,
  Wallet,
  Banknote,
  CreditCard,
  Gem,
  User,
  Users,
  Heart,
  UserCheck,
  Check
} from 'lucide-react';
import { Button, Card } from '../../components/common/CommonComponents';
import {
  TirugaPreferences,
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences
} from '../../lib/preferences';
import { useAuth } from '../../lib/auth';

export const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [preferences, setPreferences] = useState<TirugaPreferences>(() => getPreferences());
  const [isSaving, setIsSaving] = useState(false);

  // STEP 1: Interests (Multi-select)
  const interestOptions = [
    { id: 'Heritage', label: 'Heritage & Temples', kannada: 'ಪರಂಪರೆ ಮತ್ತು ದೇವಾಲಯ', icon: Landmark },
    { id: 'Nature', label: 'Nature & Ghats', kannada: 'ಪ್ರಕೃತಿ ಮತ್ತು ಪಶ್ಚಿಮ ಘಟ್ಟ', icon: TreePine },
    { id: 'Food', label: 'Karnataka Food & Coffee', kannada: 'ಸ್ಥಳೀಯ ಊಟ ಮತ್ತು ಕಾಫಿ', icon: Utensils },
    { id: 'Adventure', label: 'Trekking & Adventure', kannada: 'ಸಾಹಸ ಮತ್ತು ಚಾರಣ', icon: Mountain },
    { id: 'Beaches', label: 'Coastal & Beaches', kannada: 'ಕರಾವಳಿ ತೀರಗಳು', icon: Palmtree },
    { id: 'Culture', label: 'Culture & Handicrafts', kannada: 'ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕರಕುಶಲ', icon: Palette }
  ];

  // STEP 2: Days (Single-select)
  const dayOptions = [
    { value: 1, label: '1 Day (Quick Escape)', kannada: '೧ ದಿನ (ತ್ವರಿತ ಪ್ರವಾಸ)' },
    { value: 2, label: '2 Days (Weekend Trip)', kannada: '೨ ದಿನಗಳು (ವಾರಾಂತ್ಯ)' },
    { value: 3, label: '3 Days (Long Weekend)', kannada: '೩ ದಿನಗಳು (ರಜಾದಿನಗಳು)' },
    { value: 5, label: '5 Days (Deep Exploration)', kannada: '೫ ದಿನಗಳು (ಸಮಗ್ರ ಅನ್ವೇಷಣೆ)' },
    { value: 7, label: '7+ Days (Grand Karnataka Tour)', kannada: '೭+ ದಿನಗಳು (ಕರ್ನಾಟಕ ದರ್ಶನ)' }
  ];

  // STEP 3: Budget (Single-select)
  const budgetOptions = [
    { value: 'Under ₹3,000', label: 'Under ₹3,000 (Backpacker / Budget)', icon: Wallet },
    { value: '₹3,000 - ₹5,000', label: '₹3,000 - ₹5,000 (Comfort / Value)', icon: Banknote },
    { value: '₹5,000 - ₹10,000', label: '₹5,000 - ₹10,000 (Premium Homestays)', icon: CreditCard },
    { value: '₹10,000+', label: '₹10,000+ (Luxury Resorts & Heritage)', icon: Gem }
  ];

  // STEP 4: Travel Style (Single-select)
  const styleOptions = [
    { value: 'Solo', label: 'Solo Traveler', kannada: 'ಏಕಾಂಗಿ ಪ್ರಯಾಣ', icon: User },
    { value: 'Family', label: 'Family with Kids/Elders', kannada: 'ಕುಟುಂಬದೊಂದಿಗೆ', icon: Users },
    { value: 'Romance', label: 'Couples & Romance', kannada: 'ಜೊತೆಯಾಗಿ', icon: Heart },
    { value: 'Friends', label: 'Friends Group', kannada: 'ಸ್ನೇಹಿತರ ಬಳಗ', icon: UserCheck }
  ];

  // Validation: Check if current step has a valid selection
  const isStepValid = (): boolean => {
    switch (step) {
      case 1:
        return preferences.interests.length > 0;
      case 2:
        return preferences.days > 0;
      case 3:
        return !!preferences.budget;
      case 4:
        return !!preferences.travelStyle;
      default:
        return false;
    }
  };

  const handleToggleInterest = (id: string) => {
    setPreferences((prev) => {
      const exists = prev.interests.includes(id);
      let updated: string[];
      if (exists) {
        updated = prev.interests.filter((item) => item !== id);
      } else {
        updated = [...prev.interests, id];
      }
      return { ...prev, interests: updated };
    });
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // Step 4 Finish: Persist preferences and immediately create the trip plan
      setIsSaving(true);
      await savePreferences(preferences, user?.uid);
      setIsSaving(false);

      const searchParams = new URLSearchParams(window.location.search);
      const destParam = searchParams.get('dest');

      // Map interests to best Karnataka destination if none preselected
      let targetDest = destParam || 'hampi';
      if (!destParam) {
        if (preferences.interests.includes('Beaches')) targetDest = 'gokarna';
        else if (preferences.interests.includes('Nature') || preferences.interests.includes('Adventure')) targetDest = 'coorg';
        else if (preferences.interests.includes('Heritage')) targetDest = 'hampi';
        else if (preferences.interests.includes('Food')) targetDest = 'mysuru';
      }

      // Convert budget string to numeric estimate
      let budgetNum = 5000;
      if (preferences.budget?.includes('Under ₹3,000')) budgetNum = 2800;
      else if (preferences.budget?.includes('₹3,000 - ₹5,000')) budgetNum = 4500;
      else if (preferences.budget?.includes('₹5,000 - ₹10,000')) budgetNum = 8500;
      else if (preferences.budget?.includes('₹10,000+')) budgetNum = 15000;

      navigate(`/plan?dest=${targetDest}&days=${preferences.days || 3}&budget=${budgetNum}`);
    }
  };

  const handleSkip = async () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      // Navigate to /home using existing or default preferences
      navigate('/home');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-cream text-text-main flex flex-col justify-between p-5 pb-8 select-none">
      {/* Header: Logo, Back Button, Step Counter, and Slim Progress Bar */}
      <div>
        <header className="flex items-center justify-between py-2 mb-4">
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back to previous step"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#E2DFD3] text-deep-teal hover:bg-mint transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <div className="w-10 h-10 rounded-full bg-deep-teal text-gold flex items-center justify-center shadow-xs">
                <Compass size={20} />
              </div>
            )}
            <div>
              <span className="font-bold text-base text-deep-teal tracking-tight block leading-none">
                Tiruga
              </span>
              <span className="text-[11px] font-kannada text-primary-teal font-medium">ತಿರು ಗ</span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-mint text-deep-teal">
              {step}/4
            </span>
          </div>
        </header>

        {/* Slim Progress Bar */}
        <div className="w-full h-1.5 bg-[#E2DFD3] rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary-teal transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-deep-teal tracking-tight">Let's plan your trip</h1>
          <p className="text-xs sm:text-sm text-muted-text mt-1 leading-relaxed">
            Answer 4 simple questions and get a personalised Karnataka itinerary.
          </p>
        </div>

        {/* Step Card Container */}
        <Card className="bg-white border-[#E2DFD3] shadow-sm mb-6">
          {/* STEP 1: Interests */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-[#E2DFD3] pb-3">
                <h2 className="text-base sm:text-lg font-bold text-text-main">
                  What are you interested in?
                </h2>
                <p className="text-xs text-muted-text mt-0.5">
                  Select one or more themes for your Karnataka trip
                </p>
              </div>

              <div className="space-y-2.5">
                {interestOptions.map((opt) => {
                  const isSelected = preferences.interests.includes(opt.id);
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleInterest(opt.id)}
                      className={`w-full min-h-[58px] p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-150 cursor-pointer active:scale-[0.99] text-left ${
                        isSelected
                          ? 'border-2 border-primary-teal bg-mint text-deep-teal shadow-xs'
                          : 'border-[#E2DFD3] bg-white hover:bg-cream text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary-teal text-white' : 'bg-mint text-deep-teal'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="font-semibold text-sm block leading-snug">
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-kannada text-muted-text">
                            {opt.kannada}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-primary-teal border-primary-teal text-white'
                            : 'border-[#CBD5D1] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Duration */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-[#E2DFD3] pb-3">
                <h2 className="text-base sm:text-lg font-bold text-text-main">How many days?</h2>
                <p className="text-xs text-muted-text mt-0.5">
                  Choose your preferred journey length
                </p>
              </div>

              <div className="space-y-2.5">
                {dayOptions.map((opt) => {
                  const isSelected = preferences.days === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPreferences((p) => ({ ...p, days: opt.value }))}
                      className={`w-full min-h-[58px] p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-150 cursor-pointer active:scale-[0.99] text-left ${
                        isSelected
                          ? 'border-2 border-primary-teal bg-mint text-deep-teal shadow-xs'
                          : 'border-[#E2DFD3] bg-white hover:bg-cream text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            isSelected ? 'bg-primary-teal text-white' : 'bg-mint text-deep-teal'
                          }`}
                        >
                          {opt.value}d
                        </div>
                        <div>
                          <span className="font-semibold text-sm block leading-snug">
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-kannada text-muted-text">
                            {opt.kannada}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-primary-teal border-primary-teal text-white'
                            : 'border-[#CBD5D1] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Budget */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-[#E2DFD3] pb-3">
                <h2 className="text-base sm:text-lg font-bold text-text-main">
                  What's your budget?
                </h2>
                <p className="text-xs text-muted-text mt-0.5">
                  Approximate budget per person (excluding major transport)
                </p>
              </div>

              <div className="space-y-2.5">
                {budgetOptions.map((opt) => {
                  const isSelected = preferences.budget === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPreferences((p) => ({ ...p, budget: opt.value }))}
                      className={`w-full min-h-[58px] p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-150 cursor-pointer active:scale-[0.99] text-left ${
                        isSelected
                          ? 'border-2 border-primary-teal bg-mint text-deep-teal shadow-xs'
                          : 'border-[#E2DFD3] bg-white hover:bg-cream text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary-teal text-white' : 'bg-mint text-deep-teal'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <span className="font-semibold text-sm leading-snug">{opt.label}</span>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-primary-teal border-primary-teal text-white'
                            : 'border-[#CBD5D1] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Travel Style */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-[#E2DFD3] pb-3">
                <h2 className="text-base sm:text-lg font-bold text-text-main">
                  What's your travel style?
                </h2>
                <p className="text-xs text-muted-text mt-0.5">
                  Helps us tune pacing, stays, and activities
                </p>
              </div>

              <div className="space-y-2.5">
                {styleOptions.map((opt) => {
                  const isSelected = preferences.travelStyle === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPreferences((p) => ({ ...p, travelStyle: opt.value }))}
                      className={`w-full min-h-[58px] p-3.5 rounded-2xl flex items-center justify-between border transition-all duration-150 cursor-pointer active:scale-[0.99] text-left ${
                        isSelected
                          ? 'border-2 border-primary-teal bg-mint text-deep-teal shadow-xs'
                          : 'border-[#E2DFD3] bg-white hover:bg-cream text-text-main'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-primary-teal text-white' : 'bg-mint text-deep-teal'
                          }`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <span className="font-semibold text-sm block leading-snug">
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-kannada text-muted-text">
                            {opt.kannada}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-primary-teal border-primary-teal text-white'
                            : 'border-[#CBD5D1] bg-white'
                        }`}
                      >
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Sticky Controls: Next/Finish and Skip */}
      <div className="pt-2">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isStepValid() || isSaving}
          onClick={handleNext}
          className="shadow-md text-base"
        >
          {isSaving ? 'Building your trip...' : step === 4 ? 'Finish' : 'Next'}
        </Button>

        <div className="text-center mt-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-muted-text hover:text-text-main py-2 px-4 rounded-lg cursor-pointer transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
