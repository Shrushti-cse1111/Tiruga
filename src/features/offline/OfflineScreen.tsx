import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Smartphone,
  Download,
  CheckCircle2,
  Trash2,
  Languages,
  AlertCircle,
  Clock,
  Compass,
  Info
} from 'lucide-react';
import { getTrip } from '../../data/seedTrip';
import { SEED_DESTINATIONS } from '../../data/seedDestinations';
import {
  saveTripOffline,
  getOfflineTrip,
  removeOfflineTrip,
  hasOfflineTrip
} from '../../lib/offlineStore';
import { useLanguage, Language } from '../../lib/languageContext';
import {
  Button,
  Card,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

export const OfflineScreen: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const [currentTrip, setCurrentTrip] = useState<any | null>(null);
  const [isOfflineActive, setIsOfflineActive] = useState<boolean>(false);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadStep, setDownloadStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load default current trip
    getTrip('trip_hampi_3d').then(async (trip) => {
      setCurrentTrip(trip);
      if (trip) {
        const isSaved = await hasOfflineTrip(trip.id);
        setIsOfflineActive(isSaved);
        if (isSaved) {
          const storedTime = localStorage.getItem(`offline_saved_time_${trip.id}`);
          setSavedTimestamp(storedTime || new Date().toLocaleString());
        }
      }
    });
  }, []);

  const handleDownload = async () => {
    if (!currentTrip) return;
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      setDownloadStep('Saving itinerary...');
      await new Promise((r) => setTimeout(r, 400));

      setDownloadStep('Saving destination info...');
      const destination = SEED_DESTINATIONS.find((d) => d.id === currentTrip.destinationId) || null;
      await new Promise((r) => setTimeout(r, 400));

      setDownloadStep('Saving phrases...');
      await new Promise((r) => setTimeout(r, 400));

      const success = await saveTripOffline(currentTrip, destination, []);
      if (!success) {
        throw new Error('Could not write to local storage database.');
      }

      const now = new Date().toLocaleString();
      localStorage.setItem(`offline_saved_time_${currentTrip.id}`, now);
      setSavedTimestamp(now);
      setIsOfflineActive(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Offline download failed. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadStep('');
    }
  };

  const handleRemoveDownload = async () => {
    if (!currentTrip) return;
    try {
      await removeOfflineTrip(currentTrip.id);
      localStorage.removeItem(`offline_saved_time_${currentTrip.id}`);
      setIsOfflineActive(false);
      setSavedTimestamp(null);
    } catch (err: any) {
      setErrorMessage('Failed to remove download.');
    }
  };

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      <div className="flex-1 p-4 space-y-5">
        {/* 1. Header with back arrow */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-11 h-11 rounded-full bg-white border border-[#E2DFD3] flex items-center justify-center text-text-main hover:bg-[#F0ECE1] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal">
              {t('offline.title')}
            </h1>
            <p className="text-xs text-muted-text">Zero network reliability & preferences</p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl flex items-center space-x-2 text-xs text-rose-800">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 8. Language Toggle */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <Languages size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-main">Language / ಭಾಷೆ</h3>
                <p className="text-[11px] text-muted-text">Choose your interface language</p>
              </div>
            </div>

            {/* Segmented Control */}
            <div className="flex bg-[#EFECE2] p-1 rounded-full">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-deep-teal text-white shadow-xs'
                    : 'text-muted-text hover:text-text-main'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`py-1.5 px-4 rounded-full text-xs font-bold font-kannada transition-all cursor-pointer ${
                  language === 'kn'
                    ? 'bg-deep-teal text-white shadow-xs'
                    : 'text-muted-text hover:text-text-main'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>

          <div className="bg-cream p-2.5 rounded-xl border border-[#E2DFD3] flex items-start space-x-2 text-[11px] text-muted-text">
            <Info size={14} className="text-primary-teal shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Note: Kannada UI translations are curated for travel ease. Please have a native speaker review before public demonstration.
            </p>
          </div>
        </div>

        {/* 2. Download Trip Card / Empty State */}
        {!currentTrip ? (
          <EmptyState
            title="No Active Trip"
            subtitle="Plan an itinerary first to enable offline downloads."
            actionText="Plan a Trip"
            onAction={() => navigate('/onboarding')}
          />
        ) : (
          <div className="bg-white p-5 rounded-3xl border border-[#E2DFD3] shadow-xs space-y-4">
            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              {/* Phone Illustration with Download Arrow */}
              <div className="w-20 h-20 rounded-3xl bg-mint flex items-center justify-center text-deep-teal relative shadow-inner">
                <Smartphone size={36} strokeWidth={1.75} />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-deep-teal text-white flex items-center justify-center border-2 border-white shadow-xs">
                  <Download size={16} />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-text-main font-heading">
                  {t('offline.go_offline')}
                </h2>
                <p className="text-xs text-muted-text mt-1 max-w-xs leading-relaxed">
                  Your trip will be saved for offline use. Itinerary, key destination info and phrases will be available without internet.
                </p>
              </div>
            </div>

            {/* Current Trip Summary */}
            <div className="bg-cream p-3 rounded-2xl border border-[#E2DFD3] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-deep-teal">{currentTrip.title}</span>
                <p className="text-[10px] text-muted-text">{currentTrip.totalDays} Days · Hampi</p>
              </div>
              <span className="text-xs font-semibold text-primary-teal">Active Itinerary</span>
            </div>

            {/* 4. Downloading Progress or Status */}
            {isDownloading ? (
              <div className="bg-mint/40 p-4 rounded-2xl border border-primary-teal/30 space-y-2 text-center">
                <div className="w-5 h-5 border-2 border-primary-teal border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-deep-teal">{downloadStep}</p>
                <p className="text-[10px] text-muted-text">Writing to device IndexedDB storage...</p>
              </div>
            ) : isOfflineActive ? (
              <div className="bg-[#EBF7F2] p-4 rounded-2xl border border-primary-teal/40 space-y-3 animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-primary-teal text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-deep-teal">Offline mode is now active</h4>
                    {savedTimestamp && (
                      <p className="text-[10px] text-muted-text mt-0.5 flex items-center">
                        <Clock size={11} className="mr-1 text-primary-teal" />
                        Saved: {savedTimestamp}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-primary-teal/20">
                  <button
                    type="button"
                    onClick={handleRemoveDownload}
                    className="text-xs text-terracotta hover:underline font-semibold flex items-center space-x-1 cursor-pointer py-1"
                  >
                    <Trash2 size={13} />
                    <span>Remove download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/trip/${currentTrip.id}`)}
                    className="text-xs text-primary-teal font-bold hover:underline cursor-pointer"
                  >
                    Open Trip →
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleDownload}
              >
                <Download size={16} className="mr-2" />
                <span>{t('offline.download_trip')}</span>
              </Button>
            )}
          </div>
        )}

        {/* Offline Features Information */}
        <div className="space-y-2 text-xs text-muted-text">
          <div className="p-3 bg-white rounded-2xl border border-[#E2DFD3] flex items-start space-x-2">
            <CheckCircle2 size={15} className="text-primary-teal shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-text-main">Available Offline: </span>
              Day timelines, place descriptions, audio pronunciation notes, and curated Kannada phrases.
            </p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#E2DFD3] flex items-start space-x-2">
            <Info size={15} className="text-amber-700 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-text-main">Requires Internet: </span>
              Live AI generative queries (Modify with AI, Ask about this place) need an active connection.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
