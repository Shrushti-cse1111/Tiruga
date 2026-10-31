import React, { useState, useEffect, useMemo } from 'react';
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
  Map as MapIcon,
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
import attractionsCatalog from '../../../data/attractions.json';
import destinationsCatalog from '../../../data/destinations.json';
import { buildRoute } from '../../lib/route';
import { RouteSketch } from '../../components/map/RouteSketch';
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

function generateCatalogItinerary(
  destIdParam: string,
  daysParam: number,
  budgetParam: number,
  prefs: any
): Trip {
  const destId = (destIdParam || 'hampi').toLowerCase();
  const allDestinations = Array.isArray(destinationsCatalog) ? destinationsCatalog : [];
  let dest = allDestinations.find((d: any) => d.id === destId || d.name.toLowerCase() === destId);
  if (!dest) {
    dest = allDestinations[0] || {
      id: 'hampi',
      name: 'Hampi',
      kannadaName: 'ಹಂಪಿ',
      description: 'UNESCO World Heritage boulder landscape and monumental Vijayanagara ruins.',
      image: 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Virupaksha Temple', 'Stone Chariot', 'Matanga Hill']
    };
  }

  const allAttractions = Array.isArray(attractionsCatalog) ? (attractionsCatalog as any[]) : [];
  let destAttractions = allAttractions.filter((a: any) => a.destinationId === dest.id);
  if (destAttractions.length === 0) {
    destAttractions = allAttractions.slice(0, 12);
  }

  const times = ['09:00 AM', '11:30 AM', '02:30 PM', '05:00 PM'];
  const totalDays = Math.max(1, Math.min(daysParam || 3, 7));
  const days: Day[] = [];
  let attIdx = 0;

  for (let d = 1; d <= totalDays; d++) {
    const dayItems: TripItem[] = [];
    const itemsPerDay = Math.min(3, Math.max(2, Math.ceil(destAttractions.length / totalDays)));

    for (let i = 0; i < itemsPerDay; i++) {
      const att = destAttractions[attIdx % destAttractions.length];
      attIdx++;

      dayItems.push({
        time: times[i % times.length],
        attractionId: att.id,
        title: att.name,
        category: (att.category || 'heritage').toLowerCase(),
        estimatedCost: att.estimatedCost ?? att.estimatedEntryFee ?? 0,
        durationMinutes: att.durationMinutes || 90,
        reason: att.description || `Curated top attraction in ${dest.name}`,
        tags: [att.category || 'Heritage', 'Curated', 'Verified'],
        travelToNextMinutes: i < itemsPerDay - 1 ? 15 : undefined
      });
    }

    days.push({
      dayNumber: d,
      summary: `Day ${d} exploring iconic landmarks, cultural treasures, and scenic highlights of ${dest.name}.`,
      items: dayItems
    });
  }

  const tripId = `trip_${dest.id}_${Date.now()}`;
  return {
    id: tripId,
    title: `${totalDays}-Day ${dest.name} Explorer`,
    destination: dest.name,
    destinationId: dest.id,
    totalDays,
    estimatedBudget: budgetParam > 500 ? budgetParam : 4500,
    travelStyle: prefs?.travelStyle || 'Balanced',
    heroImage: dest.image || 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=80',
    tags: [dest.name, `${totalDays} Days`, 'Curated Itinerary'],
    days
  };
}

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
  const [isPdfSheetOpen, setIsPdfSheetOpen] = useState<boolean>(false);

  // Offline download simulation
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  // Bottom sheets
  const [isFullItineraryOpen, setIsFullItineraryOpen] = useState<boolean>(false);
  const [isModifySheetOpen, setIsModifySheetOpen] = useState<boolean>(false);
  const [isCheaperSheetOpen, setIsCheaperSheetOpen] = useState<boolean>(false);
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

  // Map route preparation
  const attractionsById = useMemo(() => {
    const map: Record<string, any> = {};
    if (Array.isArray(attractionsCatalog)) {
      attractionsCatalog.forEach((att: any) => {
        if (att && att.id) {
          map[att.id] = att;
        }
      });
    }
    return map;
  }, []);

  const tripRoute = useMemo(() => {
    if (!trip) return null;
    return buildRoute(trip, attractionsById);
  }, [trip, attractionsById]);

  const totalStopsCount = useMemo(() => {
    if (!tripRoute) return 0;
    return tripRoute.days.reduce((acc, d) => acc + d.stops.length, 0);
  }, [tripRoute]);

  const parseBudgetFromPref = (b?: string): number => {
    if (!b) return 6000;
    if (b.includes('Under ₹3,000')) return 3000;
    if (b.includes('₹3,000 - ₹5,000')) return 5000;
    if (b.includes('₹5,000 - ₹10,000')) return 8000;
    if (b.includes('₹10,000+')) return 15000;
    const num = parseInt(b.replace(/[^\d]/g, ''), 10);
    return isNaN(num) || num < 500 ? 6000 : num;
  };

  // Load trip on mount or generate via AI/catalog fallback if on /plan
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

      // 2. If route is /plan, generate trip (AI or curated catalog fallback)
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const prefs = getPreferences();

        const destParam = searchParams.get('dest') || searchParams.get('destinationId') || 'hampi';
        const daysParam = parseInt(searchParams.get('days') || '', 10) || prefs.days || 3;
        const budgetParam = parseInt(searchParams.get('budget') || '', 10) || parseBudgetFromPref(prefs.budget);

        let finalTrip: Trip | null = null;

        // Try AI planning if online
        if (isOnline) {
          try {
            const res = await planTrip({
              destinationId: destParam,
              days: daysParam,
              budget: budgetParam,
              travellerType: prefs.travelStyle || 'Solo',
              travelStyle: prefs.travelStyle || 'Balanced',
              interests: prefs.interests && prefs.interests.length > 0 ? prefs.interests : ['Heritage', 'Nature']
            });

            if (res.ok && res.data) {
              const plan = res.data;
              const tripId = `trip_${plan.destinationId}_${Date.now()}`;
              const heroImages: Record<string, string> = {
                hampi: 'https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1200&q=80',
                mysuru: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
                coorg: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
                gokarna: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80'
              };

              finalTrip = {
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
            }
          } catch (aiErr) {
            console.warn('AI planTrip call failed or key not configured, falling back to curated itinerary:', aiErr);
          }
        }

        // If AI generation was not used or failed (e.g. no GEMINI_API_KEY in env, or offline), use rich curated catalog
        if (!finalTrip) {
          finalTrip = generateCatalogItinerary(destParam, daysParam, budgetParam, prefs);
        }

        await saveTrip(finalTrip, user?.uid);

        if (mounted) {
          setTrip(finalTrip);
          setIsLoading(false);
          navigate(`/trip/${finalTrip.id}`, { replace: true });
        }
      } catch (err: any) {
        if (mounted) {
          // Final fallback to prevent any stalling
          const prefs = getPreferences();
          const fallback = generateCatalogItinerary('hampi', 3, 5000, prefs);
          setTrip(fallback);
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
        {/* 1. Hero Destination Image */}
        <div className="relative rounded-b-[32px] overflow-hidden shadow-md">
          <ImageWithFallback
            src={trip.heroImage}
            alt={trip.destination}
            aspectRatio="aspect-[16/10]"
            fallbackTitle={trip.destination}
            className="w-full h-full object-cover"
          />
          {/* Deep Teal Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-teal via-deep-teal/40 to-transparent flex flex-col justify-between p-4 sm:p-5">
            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between z-10">
              <button
                type="button"
                onClick={() => navigate('/home')}
                aria-label="Back to home"
                className="w-11 h-11 rounded-full bg-deep-teal/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep-teal transition-colors border border-white/20 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPdfSheetOpen(true)}
                  aria-label="Download trip PDF guide"
                  className="w-11 h-11 rounded-full bg-deep-teal/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep-teal transition-colors border border-white/20 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-teal"
                >
                  <FileDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/trip/${trip.id || id || 'demo'}/map`)}
                  aria-label="View trip route map"
                  className="w-11 h-11 rounded-full bg-deep-teal/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep-teal transition-colors border border-white/20 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-teal"
                >
                  <MapIcon size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  aria-label="Save trip"
                  className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-gold text-deep-teal border-gold'
                      : 'bg-deep-teal/60 text-white border-white/20 hover:bg-deep-teal'
                  }`}
                >
                  <Bookmark size={18} fill={isSaved ? '#103F38' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModifySheetOpen(true)}
                  aria-label="Modify trip with AI"
                  className="w-11 h-11 rounded-full bg-deep-teal/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-deep-teal transition-colors border border-white/20 cursor-pointer"
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
                <span className="bg-gold text-deep-teal font-extrabold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-xs">
                  <Sparkles size={11} className="fill-deep-teal" /> AI-generated
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
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
          {/* 2. Summary Row (Three equal mini-cards) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-deep-teal mb-1">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-bold text-text-main">{trip.totalDays} Days</span>
              <span className="text-[10px] text-muted-text mt-0.5">Duration</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-deep-teal mb-1">
                <Wallet size={16} />
              </div>
              <span className="text-xs font-bold text-text-main">
                ₹{trip.estimatedBudget.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-muted-text mt-0.5">Estimated</span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-deep-teal mb-1">
                <Sparkles size={16} className="text-gold" />
              </div>
              <span className="text-xs font-bold text-text-main truncate max-w-full">
                {trip.travelStyle}
              </span>
              <span className="text-[10px] text-muted-text mt-0.5">Style</span>
            </div>
          </div>

          {/* Quick Access Action Banners (Travel Options & Plan B) */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/travel-options"
              className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs flex items-center justify-between hover:border-primary-teal transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                  <Bus size={16} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-text-main group-hover:text-primary-teal transition-colors">
                    Travel Options
                  </div>
                  <div className="text-[10px] text-muted-text">Buses, Trains, Cabs</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-text" />
            </Link>

            <Link
              to="/plan-b"
              className="bg-white p-3 rounded-2xl border border-terracotta/30 bg-terracotta/5 shadow-xs flex items-center justify-between hover:border-terracotta transition-colors group cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center">
                  <Umbrella size={16} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-text-main group-hover:text-terracotta transition-colors">
                    Plan B & Weather
                  </div>
                  <div className="text-[10px] text-muted-text">Rain & Heat Adapt</div>
                </div>
              </div>
              <ChevronRight size={14} className="text-terracotta" />
            </Link>
          </div>

          {/* Compact Route Preview Card */}
          {tripRoute && tripRoute.days.length > 0 && totalStopsCount > 0 && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/trip/${trip.id || id || 'demo'}/map`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/trip/${trip.id || id || 'demo'}/map`);
                }
              }}
              aria-label="Your route preview, opens full map"
              className="bg-white rounded-2xl border border-[#E2DFD3] shadow-xs overflow-hidden cursor-pointer hover:border-primary-teal transition-all group focus:outline-none focus:ring-2 focus:ring-primary-teal"
            >
              <div className="p-3 pb-2 flex items-center justify-between border-b border-[#F0ECE1] bg-white">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-mint text-deep-teal flex items-center justify-center">
                    <MapIcon size={14} />
                  </div>
                  <span className="text-xs font-bold text-text-main group-hover:text-primary-teal transition-colors">
                    Your route
                  </span>
                  <span className="text-[10px] text-muted-text font-medium">
                    ({totalStopsCount} stops)
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-primary-teal text-xs font-bold">
                  <span>Open full map</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <div className="h-[180px] w-full relative pointer-events-none bg-[#FDFCF7]">
                <RouteSketch
                  days={tripRoute.days}
                  activeDay="all"
                  className="h-full w-full rounded-b-2xl border-none shadow-none"
                  disclaimerText="Route sketch · Tap to open interactive map"
                />
              </div>
            </div>
          )}

          {/* 3. Day Tabs (Pill segmented tabs) */}
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {trip.days.map((d, idx) => {
              const isActive = idx === activeDayIndex;
              return (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`min-h-[44px] px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-deep-teal text-white shadow-sm'
                      : 'bg-white text-muted-text border border-[#E2DFD3] hover:text-text-main'
                  }`}
                >
                  Day {d.dayNumber}
                </button>
              );
            })}
          </div>

          {/* 4. Day Header */}
          <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-[#E2DFD3]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-main">
                Day {currentDay.dayNumber} – {trip.destination}
              </h2>
              <span className="text-xs font-bold text-primary-teal bg-mint px-2.5 py-1 rounded-full">
                ₹{dayTotalCost} · Estimated
              </span>
            </div>
            <p className="text-xs text-muted-text mt-1 leading-relaxed">{currentDay.summary}</p>
          </div>

          {/* 5. Vertical Timeline */}
          <div className="relative pl-6 space-y-5 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2DFD3]">
            {currentDay.items.map((item, index) => {
              return (
                <div key={item.attractionId + index} className="relative group">
                  {/* Circular Node */}
                  <div className="absolute -left-[23px] top-1.5 w-8 h-8 rounded-full bg-white border-2 border-primary-teal shadow-xs flex items-center justify-center z-10">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs hover:border-primary-teal/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-primary-teal font-mono">
                            {item.time}
                          </span>
                          <span className="text-[11px] text-muted-text flex items-center">
                            <Clock size={12} className="mr-1" />
                            {item.durationMinutes} min
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-text-main mt-1">{item.title}</h3>
                      </div>

                      {/* Cost chip */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.estimatedCost === 0
                            ? 'bg-mint text-deep-teal'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.estimatedCost === 0 ? 'Free (Estimated)' : `₹${item.estimatedCost} · Estimated`}
                      </span>
                    </div>

                    {/* Why this was picked */}
                    <p className="text-xs text-muted-text mt-2 leading-relaxed bg-cream/70 p-2 rounded-xl">
                      <span className="font-semibold text-text-main">Why picked: </span>
                      {item.reason}
                    </p>

                    {/* Small Reason Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-medium bg-[#F0ECE1] text-text-main px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}

                      {/* Google Maps Live Link */}
                      {(() => {
                        const att = attractionsById[item.attractionId];
                        const mapQuery = att?.lat && att?.lng
                          ? `${att.lat},${att.lng}`
                          : encodeURIComponent(`${item.title}, ${trip.destination}, Karnataka`);
                        const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
                        return (
                          <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-semibold flex items-center text-primary-teal hover:underline bg-mint/60 px-2 py-0.5 rounded-full border border-primary-teal/20"
                            aria-label={`Open ${item.title} on Google Maps`}
                          >
                            <MapPin size={11} className="mr-1 text-primary-teal" />
                            Google Maps ↗
                          </a>
                        );
                      })()}

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
                          !isOnline ? 'text-muted-text opacity-50' : 'text-primary-teal hover:underline'
                        }`}
                        title={!isOnline ? 'AI features need an internet connection.' : undefined}
                      >
                        <HelpCircle size={12} className="mr-1" />
                        Ask about this place
                      </button>
                    </div>
                  </div>

                  {/* Travel Time to Next Item */}
                  {item.travelToNextMinutes && (
                    <div className="flex items-center space-x-2 py-2 text-[11px] text-muted-text font-medium">
                      <Car size={13} className="text-primary-teal ml-1" />
                      <span>~{item.travelToNextMinutes} min auto / walk to next spot</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 6. Action Area */}
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="white"
                size="md"
                className="w-full text-xs"
                onClick={() => setIsFullItineraryOpen(true)}
              >
                View Full Itinerary
              </Button>

              <Button
                variant="primary"
                size="md"
                className={`w-full text-xs ${!isOnline ? 'opacity-50' : ''}`}
                disabled={!isOnline}
                onClick={() => {
                  if (!isOnline) {
                    showToast('AI features need an internet connection.');
                    return;
                  }
                  setIsModifySheetOpen(true);
                }}
                title={!isOnline ? 'AI features need an internet connection.' : undefined}
              >
                <Sparkles size={14} className="mr-1.5 text-gold" />
                Modify with AI
              </Button>
            </div>

            {/* Download Trip PDF Guide */}
            <Button
              variant="white"
              size="md"
              className="w-full text-xs border border-deep-teal/40 text-deep-teal hover:bg-mint/20 font-bold flex items-center justify-center cursor-pointer min-h-[44px]"
              onClick={() => setIsPdfSheetOpen(true)}
            >
              <FileDown size={15} className="mr-1.5 text-deep-teal" />
              Download Trip PDF (Printable Guide)
            </Button>

            {/* Make it Cheaper (Budget Optimizer) Button */}
            <Button
              variant="white"
              size="md"
              className="w-full text-xs border border-primary-teal text-primary-teal hover:bg-mint/30 font-bold flex items-center justify-center cursor-pointer"
              onClick={() => setIsCheaperSheetOpen(true)}
            >
              <Wallet size={14} className="mr-1.5 text-primary-teal" />
              Make it cheaper (Budget Optimizer)
            </Button>

            {/* Offline Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloaded || isDownloading}
              className={`w-full min-h-[48px] rounded-full border px-4 py-2.5 text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                isDownloaded
                  ? 'bg-mint text-deep-teal border-primary-teal/30'
                  : 'bg-white text-text-main border-[#E2DFD3] hover:border-primary-teal'
              }`}
            >
              {isDownloading ? (
                <div className="w-full flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-deep-teal border-t-transparent rounded-full animate-spin" />
                  <span>Downloading offline maps ({downloadProgress}%)...</span>
                </div>
              ) : isDownloaded ? (
                <div className="flex items-center space-x-1.5">
                  <Check size={16} className="text-deep-teal" />
                  <span>Downloaded for Offline Use ✓</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Download size={15} />
                  <span>Download for Offline Use</span>
                </div>
              )}
            </button>
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

      {/* PDF Download Options Sheet */}
      {trip && (
        <DownloadPdfOptionsSheet
          isOpen={isPdfSheetOpen}
          onClose={() => setIsPdfSheetOpen(false)}
          trip={trip}
        />
      )}
    </div>
  );
};
