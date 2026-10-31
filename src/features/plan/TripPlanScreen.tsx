import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  SlidersHorizontal,
  Clock,
  Wallet,
  Sparkles,
  Calendar,
  Landmark,
  Utensils,
  Mountain,
  Camera,
  MapPin,
  Car,
  Bookmark,
  Download,
  Share2,
  HelpCircle,
  Check,
  X,
  ChevronRight,
  AlertTriangle,
  Umbrella,
  Bus,
  RefreshCw,
  WifiOff,
  FileDown
} from 'lucide-react';
import { Trip, Day, TripItem } from '../../data/types';
import { askAboutPlace } from '../../data/seedTrip';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import { getOfflineTrip } from '../../lib/offlineStore';
import { useAuth } from '../../lib/auth';
import { saveTrip, getTrip } from '../../lib/db';
import {
  planTrip,
  modifyTrip as modifyTripAi,
  makeCheaper,
  MakeCheaperResponse
} from '../../lib/aiClient';
import { Itinerary } from '../../shared/aiTypes';
import { getPreferences } from '../../lib/preferences';
import demoTripJson from '../../../data/demoTrip.json';
import { AskAboutPlaceSheet } from '../../components/common/AskAboutPlaceSheet';
import { DownloadPdfOptionsSheet } from '../../components/pdf/DownloadPdfOptionsSheet';
import {
  ImageWithFallback,
  Button,
  Card,
  Chip,
  LoadingSkeleton,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

export const TripPlanScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isOnline = useOnlineStatus();
  const [askPlaceName, setAskPlaceName] = useState<string | null>(null);

  const { user } = useAuth();
  const isDemoParam = new URLSearchParams(window.location.search).get('demo') === '1';

  // State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Offline download simulation
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  // Bottom sheets
  const [isFullItineraryOpen, setIsFullItineraryOpen] = useState<boolean>(false);
  const [isModifySheetOpen, setIsModifySheetOpen] = useState<boolean>(false);
  const [isCheaperSheetOpen, setIsCheaperSheetOpen] = useState<boolean>(false);
  const [isPdfOptionsOpen, setIsPdfOptionsOpen] = useState<boolean>(false);
  const [modifyPrompt, setModifyPrompt] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);
  const [modifiedPreview, setModifiedPreview] = useState<Trip | null>(null);
  const [modifyBeforeAfter, setModifyBeforeAfter] = useState<{
    budgetBefore: number;
    budgetAfter: number;
    added: Array<{ id: string; name: string }>;
    removed: Array<{ id: string; name: string }>;
  } | null>(null);
  const [modifyError, setModifyError] = useState<string | null>(null);

  // Budget Optimizer state
  const [isFindingSavings, setIsFindingSavings] = useState<boolean>(false);
  const [cheaperError, setCheaperError] = useState<string | null>(null);
  const [cheaperResult, setCheaperResult] = useState<MakeCheaperResponse | null>(null);

  // Ask about place sheet
  const [activePlaceQuestion, setActivePlaceQuestion] = useState<{
    place: TripItem;
    isOpen: boolean;
  } | null>(null);
  const [placeQuery, setPlaceQuery] = useState<string>('');
  const [placeAnswer, setPlaceAnswer] = useState<{
    answer: string;
    confidence: number;
    source: string;
  } | null>(null);
  const [isAskingPlace, setIsAskingPlace] = useState<boolean>(false);

  const parseBudgetFromPref = (b?: string): number => {
    if (!b) return 6000;
    if (b.includes('Under ₹3,000')) return 3000;
    if (b.includes('₹3,000 - ₹5,000')) return 5000;
    if (b.includes('₹5,000 - ₹10,000')) return 8000;
    if (b.includes('₹10,000+')) return 15000;
    const num = parseInt(b.replace(/[^\d]/g, ''), 10);
    return isNaN(num) || num < 500 ? 6000 : num;
  };

  // Load trip on mount or generate via AI if on /plan
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    const loadOrPlanTrip = async () => {
      // 1. If an ID is present (e.g. /trip/:id), load existing trip
      if (id && id !== 'new') {
        try {
          if (!isOnline) {
            const offlineData = await getOfflineTrip(id);
            if (offlineData && mounted) {
              setTrip(offlineData);
              setIsLoading(false);
              return;
            }
          }
          const data = await getTrip(id, user?.uid);
          if (mounted) {
            if (data) {
              setTrip(data);
            } else {
              const offlineData = await getOfflineTrip(id);
              if (offlineData) {
                setTrip(offlineData);
              } else {
                setError('Trip not found.');
              }
            }
            setIsLoading(false);
          }
        } catch (err: any) {
          if (mounted) {
            const offlineData = await getOfflineTrip(id);
            if (offlineData) {
              setTrip(offlineData);
            } else {
              setError(err.message || 'Failed to load trip itinerary.');
            }
            setIsLoading(false);
          }
        }
        return;
      }

      // 2. If route is /plan, generate a fresh AI trip
      if (!isOnline) {
        if (mounted) {
          setError('AI Trip Planner requires an active internet connection.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const prefs = getPreferences();

        const destParam = searchParams.get('dest') || searchParams.get('destinationId') || 'surprise';
        const daysParam = parseInt(searchParams.get('days') || '', 10) || prefs.days || 3;
        const budgetParam = parseInt(searchParams.get('budget') || '', 10) || parseBudgetFromPref(prefs.budget);

        const res = await planTrip({
          destinationId: destParam,
          days: daysParam,
          budget: budgetParam,
          travellerType: prefs.travelStyle || 'Solo',
          travelStyle: prefs.travelStyle || 'Balanced',
          interests: prefs.interests && prefs.interests.length > 0 ? prefs.interests : ['Heritage', 'Nature']
        });

        if (!res.ok) {
          if (mounted) {
            setError(res.error?.message || 'Unable to generate trip plan.');
            setIsLoading(false);
          }
          return;
        }

        const plan = res.data;
        const tripId = `trip_${plan.destinationId}_${Date.now()}`;
        const heroImages: Record<string, string> = {
          hampi: 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=80',
          mysuru: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
          coorg: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
          gokarna: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
        };

        const newTrip: Trip = {
          id: tripId,
          title: plan.title,
          destination: plan.destination,
          destinationId: plan.destinationId,
          totalDays: plan.totalDays,
          estimatedBudget: plan.estimatedBudget,
          travelStyle: prefs.travelStyle || 'Balanced',
          heroImage: heroImages[plan.destinationId] || heroImages.hampi,
          tags: [plan.destination, `${plan.totalDays} Days`, 'AI-generated'],
          days: plan.days.map((d) => ({
            dayNumber: d.dayNumber,
            summary: d.summary,
            items: d.items.map((it) => ({
              time: it.time,
              attractionId: it.attractionId,
              title: it.title,
              category: 'heritage',
              estimatedCost: it.estimatedCost,
              durationMinutes: it.durationMinutes,
              reason: it.reason,
              tags: ['AI-selected', 'Estimated']
            }))
          }))
        };

        await saveTrip(newTrip, user?.uid);

        if (mounted) {
          setTrip(newTrip);
          setIsLoading(false);
          navigate(`/trip/${tripId}`, { replace: true });
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to generate your Karnataka trip.');
          setIsLoading(false);
        }
      }
    };

    loadOrPlanTrip();

    return () => {
      mounted = false;
    };
  }, [id, isOnline]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveToggle = async () => {
    const next = !isSaved;
    setIsSaved(next);
    if (trip) {
      try {
        await saveTrip(trip, user?.uid);
        showToast(next ? 'Trip saved to your profile' : 'Trip removed from saved');
      } catch {
        showToast(next ? 'Trip saved locally' : 'Trip removed from saved');
      }
    }
  };

  const handleUseBackup = () => {
    const backup = demoTripJson as unknown as Trip;
    setTrip(backup);
    setError(null);
    showToast('Loaded 3-day Hampi backup itinerary');
  };

  const handleRunMakeCheaper = async () => {
    if (!trip) return;
    if (!isOnline) {
      setCheaperError('Budget optimizer requires an active internet connection.');
      return;
    }
    setIsFindingSavings(true);
    setCheaperError(null);

    const itineraryPayload: Itinerary = {
      title: trip.title,
      destination: trip.destination,
      destinationId: trip.destinationId || 'hampi',
      totalDays: trip.totalDays,
      estimatedBudget: trip.estimatedBudget,
      days: trip.days.map((d) => ({
        dayNumber: d.dayNumber,
        summary: d.summary,
        items: d.items.map((it) => ({
          time: it.time,
          attractionId: it.attractionId,
          title: it.title,
          estimatedCost: it.estimatedCost,
          durationMinutes: it.durationMinutes,
          reason: it.reason || ''
        }))
      }))
    };

    try {
      const res = await makeCheaper(itineraryPayload);
      if (!res.ok) {
        setCheaperError(res.error?.message || 'Unable to optimize budget.');
        return;
      }
      setCheaperResult(res.data);
    } catch (err: any) {
      setCheaperError(err.message || 'Failed to optimize budget.');
    } finally {
      setIsFindingSavings(false);
    }
  };

  const handleApplyCheaper = async () => {
    if (!cheaperResult || !trip) return;

    const optItinerary = cheaperResult.itinerary;
    const updatedTrip: Trip = {
      ...trip,
      title: optItinerary.title,
      estimatedBudget: optItinerary.estimatedBudget,
      days: optItinerary.days.map((d) => ({
        dayNumber: d.dayNumber,
        summary: `${d.summary} (Budget-Optimized)`,
        items: d.items.map((it) => ({
          time: it.time,
          attractionId: it.attractionId,
          title: it.title,
          category: 'heritage',
          estimatedCost: it.estimatedCost,
          durationMinutes: it.durationMinutes,
          reason: it.reason,
          tags: ['Budget-Optimized', 'Estimated']
        }))
      })),
      tags: Array.from(new Set([...(trip.tags || []), 'Budget-Optimized']))
    };

    setTrip(updatedTrip);
    setIsCheaperSheetOpen(false);
    setCheaperResult(null);
    setCheaperError(null);

    // Only Apply replaces the itinerary and, if saved, updates Firestore
    if (isSaved) {
      try {
        await saveTrip(updatedTrip, user?.uid);
      } catch {}
    }
    showToast(`Applied savings! New estimated total: ₹${updatedTrip.estimatedBudget}`);
  };

  useEffect(() => {
    if (isCheaperSheetOpen && !cheaperResult && !isFindingSavings && trip) {
      handleRunMakeCheaper();
    }
  }, [isCheaperSheetOpen]);

  const handleDownload = () => {
    if (isDownloaded || isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(20);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsDownloaded(true);
          showToast('Itinerary and offline maps cached!');
          return 100;
        }
        return prev + 30;
      });
    }, 250);
  };

  // Modify with AI
  const handleRunModify = async (instruction: string) => {
    if (!trip || !instruction.trim()) return;
    if (!isOnline) {
      setModifyError('Modifying trip with AI requires an active internet connection.');
      return;
    }
    setIsModifying(true);
    setModifyError(null);

    const itineraryPayload: Itinerary = {
      title: trip.title,
      destination: trip.destination,
      destinationId: trip.destinationId || 'hampi',
      totalDays: trip.totalDays,
      estimatedBudget: trip.estimatedBudget,
      days: trip.days.map((d) => ({
        dayNumber: d.dayNumber,
        summary: d.summary,
        items: d.items.map((it) => ({
          time: it.time,
          attractionId: it.attractionId,
          title: it.title,
          estimatedCost: it.estimatedCost,
          durationMinutes: it.durationMinutes,
          reason: it.reason || ''
        }))
      }))
    };

    try {
      const res = await modifyTripAi(itineraryPayload, instruction);
      if (!res.ok) {
        setModifyError(res.error?.message || 'Unable to modify itinerary.');
        return;
      }

      const { itinerary: modItinerary, beforeAfter } = res.data;
      const updatedTrip: Trip = {
        ...trip,
        title: modItinerary.title,
        estimatedBudget: modItinerary.estimatedBudget,
        totalDays: modItinerary.totalDays,
        days: modItinerary.days.map((d) => ({
          dayNumber: d.dayNumber,
          summary: d.summary,
          items: d.items.map((it) => ({
            time: it.time,
            attractionId: it.attractionId,
            title: it.title,
            category: 'heritage',
            estimatedCost: it.estimatedCost,
            durationMinutes: it.durationMinutes,
            reason: it.reason,
            tags: ['Modified', 'Estimated']
          }))
        }))
      };

      setModifiedPreview(updatedTrip);
      setModifyBeforeAfter(beforeAfter);
    } catch (err: any) {
      setModifyError(err.message || 'Failed to modify trip.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleApplyModification = async () => {
    if (modifiedPreview) {
      const updated = modifiedPreview;
      setTrip(updated);
      setModifiedPreview(null);
      setModifyBeforeAfter(null);
      setIsModifySheetOpen(false);
      setModifyError(null);

      // Only Apply updates Firestore if saved
      if (isSaved) {
        try {
          await saveTrip(updated, user?.uid);
        } catch {}
      }
      showToast('Trip itinerary updated successfully!');
    }
  };

  // Ask about place
  const handleAskPlace = async (item: TripItem, query: string) => {
    setIsAskingPlace(true);
    setPlaceQuery(query);
    try {
      const res = await askAboutPlace(item.title, query);
      setPlaceAnswer(res);
    } catch {
      setPlaceAnswer({
        answer: 'Information temporarily unavailable. Please check official ASI counters.',
        confidence: 0.5,
        source: 'Fallback guide'
      });
    } finally {
      setIsAskingPlace(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'temple':
        return <Landmark size={18} className="text-terracotta" />;
      case 'heritage':
        return <Landmark size={18} className="text-primary-teal" />;
      case 'food':
        return <Utensils size={18} className="text-gold" />;
      case 'nature':
      case 'viewpoint':
        return <Mountain size={18} className="text-primary-teal" />;
      default:
        return <Camera size={18} className="text-primary-teal" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center max-w-[430px] mx-auto p-6 space-y-4">
        <div className="flex items-center space-x-2 text-deep-teal font-bold text-sm">
          <Sparkles className="animate-spin text-gold" size={20} />
          <span>Generating your trip...</span>
        </div>
        <div className="w-full">
          <LoadingSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 max-w-[430px] mx-auto text-center">
        <div className="w-full bg-white p-6 rounded-3xl border border-[#E2DFD3] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-base font-bold text-deep-teal">Trip Planning Notice</h2>
            <p className="text-xs text-muted-text mt-1.5 leading-relaxed">{error || "We couldn't generate the itinerary."}</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              disabled={!isOnline}
              onClick={() => {
                setError(null);
                setIsLoading(true);
                window.location.reload();
              }}
            >
              <RefreshCw size={14} className="mr-1.5" /> Retry
            </Button>
            <Button variant="secondary" onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentDay = trip.days[activeDayIndex] || trip.days[0];
  const dayTotalCost = currentDay.items.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-deep-teal text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center space-x-2 animate-fade-in border border-white/20">
          <Check size={14} className="text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* 1. Hero Destination Image (16:10, radius 24px) */}
        <div className="relative rounded-[24px] overflow-hidden shadow-md mx-3 mt-3">
          <ImageWithFallback
            src={trip.heroImage}
            alt={trip.destination}
            aspectRatio="aspect-[16/10]"
            fallbackTitle={trip.destination}
            className="w-full h-full object-cover"
          />
          {/* Deep Teal Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/45 to-transparent flex flex-col justify-between p-4 sm:p-5">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between z-10">
              <button
                type="button"
                onClick={() => navigate('/home')}
                aria-label="Back to home"
                className="w-11 h-11 rounded-full bg-deep/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep transition-colors border border-white/20 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  aria-label="Save trip"
                  className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-gold text-deep border-gold'
                      : 'bg-deep/60 text-white border-white/20 hover:bg-deep'
                  }`}
                >
                  <Bookmark size={18} fill={isSaved ? '#103F38' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPdfOptionsOpen(true)}
                  aria-label="Download trip PDF"
                  title="Download trip PDF"
                  className="w-11 h-11 rounded-full bg-deep/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep transition-colors border border-white/20 cursor-pointer"
                >
                  <FileDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModifySheetOpen(true)}
                  aria-label="Modify trip with AI"
                  className="w-11 h-11 rounded-full bg-deep/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep transition-colors border border-white/20 cursor-pointer"
                >
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Hero Info */}
            <div className="text-white z-10">
              {/* Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white">
                  <span>
                    {trip.totalDays} Days · ₹{trip.estimatedBudget.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] opacity-80 ml-1.5 font-normal">(Estimated)</span>
                </div>
                <span className="bg-mint text-deep font-bold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-xs">
                  <Sparkles size={11} className="text-primary" /> AI-generated
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                {trip.destination}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
                {(trip.tags || ['Heritage', 'Adventure', 'Culture']).join(' · ')}
              </p>
            </div>
          </div>
        </div>

        {/* Padding Container for Body */}
        <div className="px-4 py-4 space-y-5">
          {/* 2. Summary Row (Three equal white mini-cards: Duration, Est. Budget, Travel Style) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3.5 rounded-[20px] border border-border shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-mint flex items-center justify-center text-deep mb-1">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold text-deep">{trip.totalDays} Days</span>
              <span className="text-[10px] text-muted mt-0.5">Duration</span>
            </div>

            <div className="bg-white p-3.5 rounded-[20px] border border-border shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-[#FFF7E6] flex items-center justify-center text-[#543b00] mb-1">
                <Wallet size={16} />
              </div>
              <span className="text-xs font-bold text-deep">
                ₹{trip.estimatedBudget.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted mt-0.5">Est. Budget</span>
            </div>

            <div className="bg-white p-3.5 rounded-[20px] border border-border shadow-xs flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-mint flex items-center justify-center text-primary mb-1">
                <Sparkles size={16} className="text-gold" />
              </div>
              <span className="text-xs font-bold text-deep truncate max-w-full">
                {trip.travelStyle}
              </span>
              <span className="text-[10px] text-muted mt-0.5">Travel Style</span>
            </div>
          </div>

          {/* 3. Day Tabs as Pills (active primary with white text) */}
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {trip.days.map((d, idx) => {
              const isActive = idx === activeDayIndex;
              return (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`h-[40px] px-5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-white text-muted border border-border hover:text-text'
                  }`}
                >
                  Day {d.dayNumber}
                </button>
              );
            })}
          </div>

          {/* 4. Day Header "Day 1 - Hampi" in deep with day total in a gold chip */}
          <div className="bg-white p-4 rounded-[22px] border border-border shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-deep">
                Day {currentDay.dayNumber} – {trip.destination}
              </h2>
              <span className="text-xs font-bold text-deep bg-gold px-3 py-1 rounded-full shadow-2xs">
                ₹{dayTotalCost} est.
              </span>
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed">{currentDay.summary}</p>
          </div>

          {/* 5. Vertical Timeline: 2px mint line, 40px circular icon nodes */}
          <div className="relative pl-7 space-y-5 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-mint">
            {currentDay.items.map((item, index) => {
              return (
                <div key={item.attractionId + index} className="relative group">
                  {/* 40px Circular Icon Node */}
                  <div className="absolute -left-[27px] top-1.5 w-10 h-10 rounded-full bg-mint border-2 border-primary shadow-xs flex items-center justify-center z-10 text-deep">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-white p-4 rounded-[20px] border border-border shadow-xs hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-primary font-mono">
                            {item.time}
                          </span>
                          <span className="text-[11px] text-muted flex items-center">
                            <Clock size={12} className="mr-1" />
                            {item.durationMinutes} min
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-deep mt-1 leading-snug">{item.title}</h3>
                      </div>

                      {/* Cost chip: "Rs 450 est." or "Free" */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          item.estimatedCost === 0
                            ? 'bg-mint text-deep'
                            : 'bg-[#FFF7E6] text-[#543b00]'
                        }`}
                      >
                        {item.estimatedCost === 0 ? 'Free' : `Rs ${item.estimatedCost} est.`}
                      </span>
                    </div>

                    {/* Two-line reason */}
                    <p className="text-xs text-muted mt-2 leading-relaxed line-clamp-2">
                      {item.reason}
                    </p>

                    {/* Small AI reason chips in mint or gold tints */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {item.tags.slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-medium bg-mint text-deep px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}

                      {/* Ask about this place link */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isOnline) {
                            showToast('AI features need an internet connection.');
                            return;
                          }
                          setAskPlaceName(item.title);
                        }}
                        className={`text-[10px] font-semibold flex items-center ml-auto cursor-pointer ${
                          !isOnline ? 'text-muted opacity-50' : 'text-primary hover:underline'
                        }`}
                        title={!isOnline ? 'AI features need an internet connection.' : undefined}
                      >
                        <HelpCircle size={12} className="mr-1 text-primary" />
                        Ask about this place
                      </button>
                    </div>
                  </div>

                  {/* Travel Time to Next Item */}
                  {item.travelToNextMinutes && (
                    <div className="flex items-center space-x-1.5 py-1.5 pl-2 text-xs text-muted font-normal">
                      <Car size={13} className="text-primary" />
                      <span>approx. {item.travelToNextMinutes} min drive</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 6. Action Area: Primary pill "View Full Itinerary", 2x2 grid of secondary buttons, "See travel options" link */}
          <div className="space-y-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full h-[52px]"
              onClick={() => setIsFullItineraryOpen(true)}
            >
              View Full Itinerary
            </Button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isOnline) {
                    showToast('AI features need an internet connection.');
                    return;
                  }
                  setIsModifySheetOpen(true);
                }}
                className="h-[52px] rounded-full bg-white hover:bg-cream text-deep border border-border shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Sparkles size={14} className="text-gold" />
                <span>Modify with AI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isOnline) {
                    showToast('AI features need an internet connection.');
                    return;
                  }
                  setAskPlaceName(trip.destination);
                }}
                className="h-[52px] rounded-full bg-white hover:bg-cream text-deep border border-border shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <HelpCircle size={14} className="text-primary" />
                <span>Ask about this place</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToggle}
                className="h-[52px] rounded-full bg-white hover:bg-cream text-deep border border-border shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <Bookmark size={14} className={isSaved ? 'text-primary fill-primary' : 'text-deep'} />
                <span>{isSaved ? 'Saved Trip' : 'Save Trip'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloaded || isDownloading}
                className="h-[52px] rounded-full bg-white hover:bg-cream text-deep border border-border shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isDownloading ? (
                  <span>Saving ({downloadProgress}%)...</span>
                ) : isDownloaded ? (
                  <>
                    <Check size={14} className="text-primary" />
                    <span>Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download size={14} className="text-deep" />
                    <span>Download offline</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPdfOptionsOpen(true)}
                className="h-[52px] rounded-full bg-white hover:bg-cream text-deep border border-border shadow-xs text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                <FileDown size={14} className="text-primary" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* "See travel options" link */}
            <div className="text-center pt-1">
              <Link
                to="/travel-options"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 py-1"
              >
                <span>See travel options</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Bottom Navigation */}
      <BottomNav />

      {/* Bottom Sheet: Full Itinerary */}
      {isFullItineraryOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2DFD3]">
            <div className="p-4 border-b border-[#E2DFD3] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-text-main">Full Karnataka Itinerary</h3>
                <p className="text-xs text-muted-text">
                  {trip.title} · {trip.totalDays} Days
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFullItineraryOpen(false)}
                className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
              {trip.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-cream/60 p-4 rounded-2xl border border-[#E2DFD3]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary-teal uppercase tracking-wider">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-xs font-medium text-muted-text">
                      ₹{day.items.reduce((acc, i) => acc + i.estimatedCost, 0)} total
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-text-main mb-2">{day.summary}</h4>
                  <ul className="space-y-2 text-xs">
                    {day.items.map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start justify-between py-1">
                        <div>
                          <span className="font-mono font-bold text-primary-teal mr-2">
                            {item.time}
                          </span>
                          <span className="font-semibold text-text-main">{item.title}</span>
                          <p className="text-[11px] text-muted-text ml-14">{item.reason}</p>
                        </div>
                        <span className="text-[11px] font-bold text-muted-text whitespace-nowrap ml-2">
                          {item.estimatedCost === 0 ? 'Free' : `₹${item.estimatedCost}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#E2DFD3] bg-white">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  setIsFullItineraryOpen(false);
                  showToast('Itinerary ready for printing / sharing');
                }}
              >
                <Share2 size={16} className="mr-2" />
                Share or Print Itinerary
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet: Modify with AI */}
      {isModifySheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2DFD3]">
            <div className="p-4 border-b border-[#E2DFD3] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                  <Sparkles size={16} className="text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">Modify Trip with AI</h3>
                  <p className="text-xs text-muted-text">Adaptive Karnataka itinerary customization</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModifySheetOpen(false);
                  setModifiedPreview(null);
                  setModifyBeforeAfter(null);
                  setModifyError(null);
                }}
                className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-text-main block mb-2">
                  Quick AI Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Add more nature',
                    'Add local food',
                    'Reduce walking',
                    'Make it family friendly'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isModifying || !isOnline}
                      onClick={() => {
                        setModifyPrompt(preset);
                        handleRunModify(preset);
                      }}
                      className="text-xs bg-cream hover:bg-mint hover:text-deep-teal text-text-main font-semibold px-3 py-2 rounded-full border border-[#E2DFD3] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-xs font-bold text-text-main block mb-1.5">
                  Or enter your own request
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={modifyPrompt}
                    disabled={isModifying || !isOnline}
                    onChange={(e) => setModifyPrompt(e.target.value)}
                    placeholder="e.g. Add more sunset points, skip steep climbs..."
                    className="flex-1 bg-cream border border-[#E2DFD3] rounded-2xl px-3.5 py-2.5 text-xs text-text-main placeholder:text-muted-text focus:outline-primary-teal disabled:opacity-50"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isModifying || !modifyPrompt.trim() || !isOnline}
                    onClick={() => handleRunModify(modifyPrompt)}
                  >
                    {isModifying ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" /> Adapting
                      </span>
                    ) : (
                      'Run'
                    )}
                  </Button>
                </div>
              </div>

              {/* Offline Warning */}
              {!isOnline && (
                <div className="p-3 bg-stone/20 text-muted-text rounded-2xl text-xs flex items-center space-x-2">
                  <WifiOff size={14} className="shrink-0" />
                  <span>Modifying itinerary requires an active internet connection.</span>
                </div>
              )}

              {/* Loading State */}
              {isModifying && (
                <div className="bg-cream/60 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 border border-[#E2DFD3]">
                  <div className="flex items-center space-x-2 text-deep-teal font-bold text-xs">
                    <RefreshCw size={15} className="animate-spin text-terracotta" />
                    <span>Updating your itinerary...</span>
                  </div>
                  <span className="text-[11px] text-muted-text">Adapting stops and preserving your preferred schedule</span>
                </div>
              )}

              {/* Error Banner with Retry */}
              {modifyError && (
                <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-terracotta font-bold">
                    <AlertTriangle size={15} />
                    <span>Modification Notice</span>
                  </div>
                  <p className="text-muted-text text-[11px] leading-relaxed">{modifyError}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isOnline}
                    onClick={() => handleRunModify(modifyPrompt)}
                  >
                    <RefreshCw size={12} className="mr-1" /> Retry
                  </Button>
                </div>
              )}

              {/* PREVIEW: Budget before/after, activities added/removed */}
              {modifiedPreview && modifyBeforeAfter && (
                <div className="bg-mint/30 border border-primary-teal/40 rounded-2xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-primary-teal/20">
                    <span className="text-xs font-bold text-deep-teal flex items-center gap-1.5">
                      <Sparkles size={13} className="text-gold" /> Preview Changes
                    </span>
                    <span className="text-[11px] font-bold text-deep-teal">
                      ₹{modifyBeforeAfter.budgetBefore} (Estimated) → ₹{modifyBeforeAfter.budgetAfter} (Estimated)
                    </span>
                  </div>

                  {/* Activities Added */}
                  {modifyBeforeAfter.added.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary-teal mb-1">
                        + Added Stops
                      </div>
                      <div className="space-y-1">
                        {modifyBeforeAfter.added.map((a) => (
                          <div
                            key={a.id}
                            className="text-xs font-semibold text-text-main flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-primary-teal/20"
                          >
                            <span className="text-emerald-600 font-bold">+</span>
                            <span>{a.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activities Removed */}
                  {modifyBeforeAfter.removed.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-terracotta mb-1">
                        - Replaced / Removed Stops
                      </div>
                      <div className="space-y-1">
                        {modifyBeforeAfter.removed.map((r) => (
                          <div
                            key={r.id}
                            className="text-xs font-semibold text-text-main flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-terracotta/20"
                          >
                            <span className="text-terracotta font-bold">-</span>
                            <span className="line-through text-muted-text">{r.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {modifyBeforeAfter.added.length === 0 && modifyBeforeAfter.removed.length === 0 && (
                    <div className="text-xs text-muted-text italic">
                      Schedule and timings adjusted to meet your instruction.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E2DFD3] bg-white flex space-x-3">
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => {
                  setIsModifySheetOpen(false);
                  setModifiedPreview(null);
                  setModifyBeforeAfter(null);
                  setModifyError(null);
                }}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs"
                disabled={!modifiedPreview}
                onClick={handleApplyModification}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Bottom Sheet: Make it Cheaper (Budget Optimizer) */}
      {isCheaperSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2DFD3]">
            {/* Header */}
            <div className="p-4 border-b border-[#E2DFD3] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-main">Make it Cheaper</h3>
                  <p className="text-xs text-muted-text">AI Budget Optimizer for Karnataka travel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCheaperSheetOpen(false);
                  setCheaperResult(null);
                  setCheaperError(null);
                }}
                className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
              {/* Offline Warning */}
              {!isOnline && (
                <div className="p-3 bg-stone/20 text-muted-text rounded-2xl text-xs flex items-center space-x-2">
                  <WifiOff size={14} className="shrink-0" />
                  <span>Budget optimization requires an active internet connection.</span>
                </div>
              )}

              {/* Loading State */}
              {isFindingSavings && (
                <div className="bg-cream/60 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 border border-[#E2DFD3]">
                  <div className="flex items-center space-x-2 text-deep-teal font-bold text-xs">
                    <RefreshCw size={16} className="animate-spin text-terracotta" />
                    <span>Finding savings...</span>
                  </div>
                  <span className="text-[11px] text-muted-text">Auditing attractions for free swaps and discounts</span>
                </div>
              )}

              {/* Error Banner with Retry */}
              {cheaperError && (
                <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center space-x-1.5 text-terracotta font-bold">
                    <AlertTriangle size={15} />
                    <span>Optimization Notice</span>
                  </div>
                  <p className="text-muted-text text-[11px] leading-relaxed">{cheaperError}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!isOnline}
                    onClick={handleRunMakeCheaper}
                  >
                    <RefreshCw size={12} className="mr-1" /> Retry
                  </Button>
                </div>
              )}

              {/* Results Preview */}
              {cheaperResult && !isFindingSavings && (() => {
                const amountSaved = Math.max(
                  0,
                  cheaperResult.beforeAfter.budgetBefore - cheaperResult.beforeAfter.budgetAfter
                );
                const isAlreadyCheapest =
                  amountSaved === 0 ||
                  cheaperResult.savingsSuggestions.some((s) =>
                    s.description.toLowerCase().includes('already near the minimum')
                  );

                if (isAlreadyCheapest) {
                  return (
                    <div className="bg-mint/40 border border-primary-teal/30 rounded-2xl p-5 text-center space-y-2 animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-mint text-deep-teal flex items-center justify-center mx-auto">
                        <Check size={20} className="text-deep-teal" />
                      </div>
                      <div className="text-sm font-bold text-deep-teal">Already Near Minimum Budget</div>
                      <p className="text-xs text-muted-text leading-relaxed">
                        {cheaperResult.savingsSuggestions[0]?.description ||
                          'Your itinerary is already optimized near the minimum estimated cost for this destination.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4 animate-fade-in">
                    {/* Before / After Comparison Card */}
                    <div className="bg-cream/80 border border-[#E2DFD3] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-text">
                        <span>Current Estimate</span>
                        <span>Optimized Budget</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-extrabold text-muted-text line-through">
                          ₹{cheaperResult.beforeAfter.budgetBefore.toLocaleString('en-IN')}
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-deep-teal">
                            ₹{cheaperResult.beforeAfter.budgetAfter.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-muted-text block">(Estimated)</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#E2DFD3] flex items-center justify-between">
                        <span className="text-xs font-bold text-deep-teal">You could save (estimated):</span>
                        <span className="text-xs font-extrabold bg-mint text-deep-teal px-2.5 py-1 rounded-full">
                          Save ₹{amountSaved.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Savings Suggestions List */}
                    {cheaperResult.savingsSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">
                          Recommended Optimizations
                        </h4>
                        <div className="space-y-2">
                          {cheaperResult.savingsSuggestions.map((sug, i) => (
                            <div
                              key={i}
                              className="bg-white border border-[#E2DFD3] p-3 rounded-xl flex items-start justify-between shadow-2xs"
                            >
                              <div className="text-xs font-medium text-text-main pr-2">
                                {sug.description}
                              </div>
                              {sug.amountSaved > 0 && (
                                <span className="text-[11px] font-bold text-deep-teal ml-2 whitespace-nowrap bg-mint px-2 py-0.5 rounded-full shrink-0">
                                  -₹{sug.amountSaved}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Activities Added / Removed Diff */}
                    {(cheaperResult.beforeAfter.added.length > 0 || cheaperResult.beforeAfter.removed.length > 0) && (
                      <div className="space-y-2 pt-1">
                        {cheaperResult.beforeAfter.added.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-primary-teal mb-1">
                              + Cheaper / Free Added Stops
                            </div>
                            <div className="space-y-1">
                              {cheaperResult.beforeAfter.added.map((a) => (
                                <div
                                  key={a.id}
                                  className="text-xs font-semibold text-text-main flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-primary-teal/20"
                                >
                                  <span className="text-emerald-600 font-bold">+</span>
                                  <span>{a.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {cheaperResult.beforeAfter.removed.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-terracotta mb-1">
                              - Replaced Expensive Stops
                            </div>
                            <div className="space-y-1">
                              {cheaperResult.beforeAfter.removed.map((r) => (
                                <div
                                  key={r.id}
                                  className="text-xs font-semibold text-text-main flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-terracotta/20"
                                >
                                  <span className="text-terracotta font-bold">-</span>
                                  <span className="line-through text-muted-text">{r.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#E2DFD3] bg-white flex space-x-3">
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => {
                  setIsCheaperSheetOpen(false);
                  setCheaperResult(null);
                  setCheaperError(null);
                }}
              >
                Discard
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs bg-deep-teal text-white font-bold"
                disabled={!cheaperResult || isFindingSavings}
                onClick={handleApplyCheaper}
              >
                Apply Savings
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Culture Guide: Reusable AskAboutPlaceSheet */}
      <AskAboutPlaceSheet
        placeName={askPlaceName || ''}
        isOpen={!!askPlaceName}
        onClose={() => setAskPlaceName(null)}
      />

      {/* Download PDF Options Sheet */}
      {trip && (
        <DownloadPdfOptionsSheet
          isOpen={isPdfOptionsOpen}
          onClose={() => setIsPdfOptionsOpen(false)}
          trip={trip}
        />
      )}
    </div>
  );
};
