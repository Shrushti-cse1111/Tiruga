import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  Calendar,
  Wallet,
  Clock,
  Compass,
  Bus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Music,
  Languages,
  BookOpen,
  PhoneCall,
  Sparkles,
  Info,
  Map as MapIcon
} from 'lucide-react';
import { Trip, Day, TripItem, TransportOption } from '../../data/types';
import { getTrip } from '../../lib/db';
import { getOfflineTrip } from '../../lib/offlineStore';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../lib/languageContext';
import { getPreferences } from '../../lib/preferences';
import { getPdfString } from '../../i18n';
import { SEED_HAMPI_TRIP } from '../../data/seedTrip';
import { SEED_PHRASES } from '../../data/seedPhrases';
import { SEED_TRANSPORT_OPTIONS } from '../../data/seedTransport';
import attractionsCatalog from '../../../data/attractions.json';
import { buildRoute, haversineKm, estimateMinutes } from '../../lib/route';
import { RouteSketch } from '../../components/map/RouteSketch';
import '../../styles/print.css';

interface PrintOptions {
  includeItinerary: boolean;
  includeCosts: boolean;
  includeTravel: boolean;
  includeRouteMap: boolean;
  includePlanB: boolean;
  includePlaylist: boolean;
  includePhrases: boolean;
  includeCulture: boolean;
  includeEmergency: boolean;
  includeName: boolean;
  paperSize: 'A4' | 'Letter';
}

interface AppliedPlanBRecord {
  dayNumber: number;
  condition: string;
  summary: string;
  changes: string[];
  budgetBefore: number;
  budgetAfter: number;
}

interface SongItem {
  title: string;
  artist: string;
  film: string;
  language: string;
  note: string;
  isPlaceSong?: boolean;
}

interface SongPhase {
  phaseName: string;
  songs: SongItem[];
}

interface CultureQA {
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
}

export const TripPrintScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'kn' ? 'kn' : 'en';

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [heroImageLoaded, setHeroImageLoaded] = useState<boolean>(false);
  const [heroImageFailed, setHeroImageFailed] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(true);
  const [isPrintingTriggered, setIsPrintingTriggered] = useState<boolean>(false);

  // Parse options from navigation state or search query
  const queryParams = new URLSearchParams(location.search);
  const navOptions = (location.state as any)?.options as PrintOptions | undefined;

  const options: PrintOptions = {
    includeItinerary: true, // always included
    includeCosts: navOptions?.includeCosts ?? queryParams.get('costs') !== '0',
    includeTravel: navOptions?.includeTravel ?? queryParams.get('travel') !== '0',
    includeRouteMap: navOptions?.includeRouteMap ?? queryParams.get('map') !== '0',
    includePlanB: navOptions?.includePlanB ?? queryParams.get('planb') === '1',
    includePlaylist: navOptions?.includePlaylist ?? queryParams.get('playlist') !== '0',
    includePhrases: navOptions?.includePhrases ?? queryParams.get('phrases') !== '0',
    includeCulture: navOptions?.includeCulture ?? queryParams.get('culture') !== '0',
    includeEmergency: navOptions?.includeEmergency ?? queryParams.get('emergency') !== '0',
    includeName: navOptions?.includeName ?? queryParams.get('name') === '1',
    paperSize: (navOptions?.paperSize || (queryParams.get('paper') === 'Letter' ? 'Letter' : 'A4')) as
      | 'A4'
      | 'Letter'
  };

  // Set paper size class on html element for print media
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('paper-a4', 'paper-letter');
    html.classList.add(options.paperSize === 'Letter' ? 'paper-letter' : 'paper-a4');

    return () => {
      html.classList.remove('paper-a4', 'paper-letter');
    };
  }, [options.paperSize]);

  // Load Trip Data safely (IndexedDB -> Firestore -> Local Storage -> Fallback)
  useEffect(() => {
    let mounted = true;
    const tripId = id || 'trip_hampi_3d';

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        // 1. Check if trip was passed in state
        const stateTrip = (location.state as any)?.trip as Trip | undefined;
        if (stateTrip && stateTrip.id === tripId) {
          if (mounted) {
            setTrip(stateTrip);
            setIsLoading(false);
          }
          return;
        }

        // 2. Try IndexedDB offline storage
        const offline = await getOfflineTrip(tripId);
        if (offline && mounted) {
          setTrip(offline);
          setIsLoading(false);
          return;
        }

        // 3. Try Firestore with UID isolation
        // If user is logged in, getTrip will only query user's trips
        // If guest, getTrip checks local storage
        const fetched = await getTrip(tripId, user?.uid);
        if (mounted) {
          if (fetched) {
            setTrip(fetched);
          } else if (tripId === 'trip_hampi_3d' || tripId === 'new') {
            setTrip(SEED_HAMPI_TRIP);
          } else {
            setLoadError(getPdfString('could_not_load', lang));
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          if (tripId === 'trip_hampi_3d') {
            setTrip(SEED_HAMPI_TRIP);
          } else {
            setLoadError(getPdfString('could_not_load', lang));
          }
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id, user?.uid, lang]);

  // Read traveller first name if privacy option is enabled
  const travellerFirstName = React.useMemo(() => {
    if (!options.includeName) return null;
    try {
      const stored = localStorage.getItem('tiruga_user_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) return parsed.name.trim().split(' ')[0];
      }
    } catch {}
    if (user?.displayName) {
      return user.displayName.trim().split(' ')[0];
    }
    return null;
  }, [options.includeName, user?.displayName]);

  // Route calculation for print
  const attractionsById = useMemo(() => {
    const map: Record<string, any> = {};
    if (Array.isArray(attractionsCatalog)) {
      attractionsCatalog.forEach((att: any) => {
        if (att && att.id) map[att.id] = att;
      });
    }
    return map;
  }, []);

  const tripRoute = useMemo(() => {
    if (!trip) return null;
    return buildRoute(trip, attractionsById);
  }, [trip, attractionsById]);

  // Travel style & type
  const travelStyle = trip?.travelStyle || getPreferences()?.travelStyle || 'Balanced';
  const travellerType = 'Solo';

  // Dynamic Date calculation at runtime
  const runtimeGeneratedDate = React.useMemo(() => {
    try {
      return new Intl.DateTimeFormat(lang === 'kn' ? 'kn-IN' : 'en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }, [lang]);

  // Plan B changes detection & simulation
  const appliedPlanBList: AppliedPlanBRecord[] = React.useMemo(() => {
    if (!trip || !options.includePlanB) return [];

    const list: AppliedPlanBRecord[] = [];
    try {
      const stored = localStorage.getItem(`tiruga_planb_${trip.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) list.push(...parsed);
        else if (parsed.dayNumber) list.push(parsed);
      }
    } catch {}

    // Check if trip itself has Plan B metadata
    if ((trip as any).appliedPlanB) {
      list.push((trip as any).appliedPlanB);
    }

    // Default simulated Plan B for Hampi when checked
    if (list.length === 0 && trip.destination.toLowerCase().includes('hampi')) {
      list.push({
        dayNumber: 1,
        condition: 'Rain',
        summary: 'Monsoon shower contingency reroute for boulder safety',
        changes: [
          "Replaced slippery Matanga hill open climb with sheltered Archaeological Museum",
          "Swapped outdoor riverside trail for covered Queen's Bath corridor",
          "Pushed Tungabhadra sunset viewpoint to Day 2 afternoon"
        ],
        budgetBefore: 1800,
        budgetAfter: 1550
      });
    }

    return list;
  }, [trip, options.includePlanB]);

  // Swara Playlist (curated for Hampi / Karnataka travel)
  const swaraPlaylistData: { name: string; tagline: string; phases: SongPhase[] } | null = React.useMemo(() => {
    if (!trip || !options.includePlaylist) return null;

    try {
      const stored = localStorage.getItem(`tiruga_playlist_${trip.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}

    // Curated Swara travel playlist for Hampi / Karnataka
    return {
      name: 'Hampi Stone Echoes & Sunsets',
      tagline: 'Curated Kannada travel rhythms for Vijayanagara ruins and Tungabhadra breeze',
      phases: [
        {
          phaseName: '1. Departure & Road Trip (ಹೊರಡುವಿಕೆ)',
          songs: [
            {
              title: 'Ninnindale',
              artist: 'Sonu Nigam',
              film: 'Milana',
              language: 'Kannada',
              note: 'Uplifting highway morning rhythm'
            },
            {
              title: 'Beladingalante Minuguta',
              artist: 'Rajesh Krishnan',
              film: 'Prem Kahani',
              language: 'Kannada',
              note: 'Smooth acoustic road trip melody'
            }
          ]
        },
        {
          phaseName: '2. Ancient Ruins & Boulder Trails (ಐತಿಹಾಸಿಕ ಹಾದಿ)',
          songs: [
            {
              title: 'Vijayanagara Vaibhava',
              artist: 'S. P. Balasubrahmanyam',
              film: 'Vijayanagarada Veeraputhra',
              language: 'Kannada',
              note: 'Place song · Vijayanagara architectural grandeur',
              isPlaceSong: true
            },
            {
              title: 'E Sanje Eke Kaadide',
              artist: 'Sonu Nigam',
              film: 'Maleyali Jotheyali',
              language: 'Kannada',
              note: 'Temple courtyard morning acoustic'
            }
          ]
        },
        {
          phaseName: '3. Hemakuta Sunset & Tungabhadra (ಸೂರ್ಯಾಸ್ತ)',
          songs: [
            {
              title: 'Anisuthide Yaako Indu',
              artist: 'Sonu Nigam',
              film: 'Mungaru Male',
              language: 'Kannada',
              note: 'Place song · Sunset reflection across Hemakuta boulders',
              isPlaceSong: true
            },
            {
              title: 'Kaada Beladingalu',
              artist: 'P. B. Sreenivas',
              film: 'Chirabandhavya',
              language: 'Kannada',
              note: 'River Tungabhadra twilight ambiance'
            }
          ]
        },
        {
          phaseName: '4. Campfire & Night Rest (ಶಾಂತ ರಾತ್ರಿ)',
          songs: [
            {
              title: 'Neene Modalu Neene Kone',
              artist: 'Shreya Ghoshal',
              film: 'Maleyali Jotheyali',
              language: 'Kannada',
              note: 'Peaceful evening wind-down'
            },
            {
              title: 'Kavithe Kavithe',
              artist: 'Vijay Prakash',
              film: 'Gaalipata',
              language: 'Kannada',
              note: 'Acoustic starlit fireside tune'
            }
          ]
        }
      ]
    };
  }, [trip, options.includePlaylist]);

  // Kannada phrases (Transport, Restaurant, Basic conversation)
  const phrasesToPrint = React.useMemo(() => {
    if (!options.includePhrases) return [];

    let customPhrases: any[] = [];
    try {
      const stored = localStorage.getItem('tiruga_saved_phrases');
      if (stored) customPhrases = JSON.parse(stored);
    } catch {}

    const defaultSets = (SEED_PHRASES || []).filter((p) =>
      ['basic conversation', 'transport', 'restaurant'].includes((p.category || '').toLowerCase())
    );

    const combined = [...customPhrases, ...defaultSets];
    // De-duplicate by kannada text
    const seen = new Set<string>();
    return combined.filter((p) => {
      const k = (p.kannada || '').trim();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 15);
  }, [options.includePhrases]);

  // Culture notes (Ask about place answers from session or stored)
  const cultureNotesToPrint: CultureQA[] = React.useMemo(() => {
    if (!trip || !options.includeCulture) return [];

    let notes: CultureQA[] = [];
    try {
      const stored = localStorage.getItem(`tiruga_culture_notes_${trip.id}`);
      if (stored) notes = JSON.parse(stored);
    } catch {}

    // If none in storage, supply high-confidence cultural notes for Hampi/Karnataka
    if (notes.length === 0) {
      notes = [
        {
          question: `What is the recommended dress code for temples and shrines in ${trip.destination}?`,
          answer: `Modest clothing covering shoulders and knees is recommended out of respect for active temple shrines in ${trip.destination}. Slip-on footwear is best as shoes must be removed outside sanctum precincts.`,
          confidence: 'high'
        },
        {
          question: `What are the best hours to explore the open monuments to avoid peak heat?`,
          answer: `Early mornings between 06:30 AM and 09:30 AM or late afternoons after 04:00 PM offer the best conditions, avoiding the intense granite boulder radiation.`,
          confidence: 'high'
        },
        {
          question: `Are cameras permitted and are guides certified by the government?`,
          answer: `Non-commercial handheld photography is permitted outside consecrated sanctums. Look for authorized guides wearing official Karnataka Tourism or ASI photo badges.`,
          confidence: 'high'
        }
      ];
    }
    return notes;
  }, [trip, options.includeCulture]);

  // Travel options (Demo data)
  const travelOptionsToPrint: TransportOption[] = React.useMemo(() => {
    if (!options.includeTravel) return [];
    return (SEED_TRANSPORT_OPTIONS || []).slice(0, 4);
  }, [options.includeTravel]);

  // Wait for fonts & images, then trigger print once
  useEffect(() => {
    if (!trip || isLoading || loadError || isPrintingTriggered) return;

    let timeoutId: NodeJS.Timeout;
    let cancelled = false;

    const prepareAndPrint = async () => {
      try {
        // Wait for fonts with a safe 3-second limit
        const fontPromise = document.fonts ? document.fonts.ready : Promise.resolve();
        const timeoutPromise = new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            setFontsLoaded(false);
            resolve(false);
          }, 3000);
        });

        await Promise.race([fontPromise, timeoutPromise]);
      } catch {
        setFontsLoaded(false);
      }

      if (!cancelled) {
        setIsPrintingTriggered(true);
        // Small delay to ensure render tree layout finishes
        setTimeout(() => {
          window.print();
        }, 350);
      }
    };

    prepareAndPrint();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [trip, isLoading, loadError, isPrintingTriggered]);

  const handleManualPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-full border-4 border-primary-teal border-t-transparent animate-spin mb-4" />
        <h2 className="text-base font-bold text-deep-teal">Preparing print document...</h2>
        <p className="text-xs text-muted-text mt-1">Rendering clean printable layout for {options.paperSize}</p>
      </div>
    );
  }

  if (loadError || !trip) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xl mb-4">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-deep-teal mb-2 font-heading">
          {getPdfString('could_not_load', lang)} (Trip Not Found)
        </h2>
        <p className="text-xs text-muted-text mb-6">
          The requested trip could not be retrieved from your saved trips or database.
        </p>
        <button
          type="button"
          onClick={() => navigate('/saved')}
          className="px-6 py-2.5 rounded-full bg-deep-teal text-white font-bold text-xs shadow-md hover:bg-[#146B5B] transition-colors cursor-pointer"
        >
          {getPdfString('back_to_trips', lang)}
        </button>
      </div>
    );
  }

  // Calculate costs
  const totalTripCost = trip.days.reduce(
    (acc, d) => acc + (d.items?.reduce((s, it) => s + (Number(it.estimatedCost) || 0), 0) || 0),
    0
  );

  return (
    <div className={`print-screen-preview min-h-screen bg-white text-[#18312D] text-[10.5pt] leading-relaxed pb-16`}>
      {/* Dynamic @page paper size rule for browser print preview */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@page { size: ${options.paperSize === 'Letter' ? 'letter' : 'A4'}; margin: 16mm 14mm 18mm; }`
        }}
      />

      {/* On-Screen Action Bar (Hidden on print) */}
      <div className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2DFD3] px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-cream border border-[#E2DFD3] text-xs font-semibold text-text-main hover:bg-[#EAE6D8] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{getPdfString('back', lang)}</span>
            </button>
            <span className="text-xs font-bold text-deep-teal hidden sm:inline">
              {trip.title} · {options.paperSize}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!fontsLoaded && (
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 hidden md:inline">
                {getPdfString('font_fallback_notice', lang)}
              </span>
            )}
            <button
              type="button"
              onClick={handleManualPrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-deep-teal text-white text-xs font-bold shadow-md hover:bg-[#146B5B] transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>{getPdfString('print_save', lang)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Document Area */}
      <div className="print-container px-6 sm:px-10 py-6 max-w-4xl mx-auto space-y-6">
        
        {/* ============================================================== */}
        {/* PAGE 1: COVER & TRIP SUMMARY                                   */}
        {/* ============================================================== */}
        <section className="space-y-5">
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-[#E2DFD3] pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-deep-teal text-white flex items-center justify-center font-black text-sm">
                🏛️
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="font-heading font-black text-2xl tracking-tight text-deep-teal">
                  Tiruga
                </span>
                <span className="kannada-subtext font-bold text-xl text-primary-teal">
                  ತಿರು ಗ
                </span>
              </div>
            </div>
            <div className="text-right text-[9pt] text-muted-text">
              <span className="font-semibold block text-deep-teal">Karnataka AI Travel Companion</span>
              <span>{runtimeGeneratedDate}</span>
            </div>
          </div>

          {/* Hero Banner or Gradient Card */}
          <div className="relative rounded-2xl overflow-hidden border border-[#D2DFD8] shadow-xs">
            {trip.heroImage && !heroImageFailed ? (
              <div className="relative aspect-[21/9] w-full bg-deep-teal overflow-hidden">
                <img
                  src={trip.heroImage}
                  alt={trip.destination}
                  onLoad={() => setHeroImageLoaded(true)}
                  onError={() => setHeroImageFailed(true)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    heroImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/95 via-deep-teal/40 to-transparent flex flex-col justify-end p-5 text-white">
                  <h1 className="text-2xl font-black font-heading text-white drop-shadow-sm">
                    {trip.title}
                  </h1>
                  <p className="text-xs text-white/90 mt-1 font-medium">
                    {trip.destination} · {trip.totalDays} {getPdfString('duration_label', lang)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="cover-banner p-6 text-white rounded-2xl">
                <h1 className="text-2xl font-black font-heading text-white">
                  {trip.title}
                </h1>
                <p className="text-xs text-white/90 mt-1 font-medium">
                  {trip.destination} · {trip.totalDays} {getPdfString('duration_label', lang)}
                </p>
              </div>
            )}
          </div>

          {/* Summary Meta Table */}
          <div className="summary-card avoid-break">
            <table className="w-full text-[10pt] border border-[#E2DFD3]">
              <tbody>
                <tr>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal w-1/4">
                    {getPdfString('destination', lang)}
                  </td>
                  <td className="w-1/4 font-semibold">{trip.destination}</td>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal w-1/4">
                    {getPdfString('duration_label', lang)}
                  </td>
                  <td className="w-1/4 font-semibold">{trip.totalDays} Days</td>
                </tr>
                <tr>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal">
                    {getPdfString('budget_label', lang)}
                  </td>
                  <td className="font-semibold">
                    ₹{trip.estimatedBudget?.toLocaleString('en-IN')}{' '}
                    <span className="text-[9pt] text-muted-text font-normal">(Estimated)</span>
                  </td>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal">
                    {getPdfString('travel_style', lang)}
                  </td>
                  <td className="font-semibold">{travelStyle}</td>
                </tr>
                <tr>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal">
                    {getPdfString('traveller_type', lang)}
                  </td>
                  <td className="font-semibold">{travellerType}</td>
                  <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal">
                    {getPdfString('trip_id', lang)}
                  </td>
                  <td className="font-mono text-[9pt]">{trip.id.slice(0, 12)}</td>
                </tr>
                {travellerFirstName && (
                  <tr>
                    <td className="bg-[#DCEFE5]/40 font-bold text-deep-teal">
                      {getPdfString('traveller_name', lang)}
                    </td>
                    <td colSpan={3} className="font-semibold text-deep-teal">
                      {travellerFirstName}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* One-Paragraph Trip Overview */}
          <div className="bg-cream/60 p-4 rounded-xl border border-[#E2DFD3] text-[10pt] leading-relaxed">
            <h3 className="font-bold text-deep-teal text-xs uppercase tracking-wider mb-1">
              Trip Overview
            </h3>
            <p className="text-text-main">
              {trip.days[0]?.summary
                ? `An immersive ${trip.totalDays}-day journey across ${trip.destination}, beginning with ${trip.days[0].summary}. Designed with cultural preservation, balanced day pace, and authentic local experiences.`
                : `A personalized ${trip.totalDays}-day travel itinerary for ${trip.destination}, Karnataka, optimized for comfortable sightseeing, rich local heritage, and quiet alternatives.`}
            </p>
          </div>
        </section>

        {/* ============================================================== */}
        {/* SECTION 1: DAY-BY-DAY ITINERARY                                 */}
        {/* ============================================================== */}
        {options.includeItinerary && (
          <section className="space-y-6 pt-2">
            <div className="border-b-2 border-deep-teal pb-1">
              <h2 className="text-lg font-bold text-deep-teal font-heading">
                {getPdfString('itinerary_section', lang)}
              </h2>
            </div>

            {trip.days.map((day: Day) => {
              const dayCost = day.items?.reduce((s, it) => s + (Number(it.estimatedCost) || 0), 0) || 0;

              return (
                <div key={day.dayNumber} className="day-card avoid-break space-y-2">
                  <div className="flex items-center justify-between bg-cream/70 px-3 py-2 rounded-lg border border-[#E2DFD3]">
                    <h3 className="font-bold text-deep-teal text-sm font-heading">
                      {getPdfString('day', lang)} {day.dayNumber} – {trip.destination}
                    </h3>
                    <span className="text-xs font-semibold text-muted-text">
                      {day.summary}
                    </span>
                  </div>

                  <table className="w-full text-[10pt] border border-[#E2DFD3]">
                    <thead>
                      <tr>
                        <th className="w-16">{getPdfString('time', lang)}</th>
                        <th>{getPdfString('activity', lang)}</th>
                        <th className="w-20">{getPdfString('duration', lang)}</th>
                        <th className="w-28 text-right">{getPdfString('estimated_cost', lang)}</th>
                        <th className="w-2/5">{getPdfString('why_this_fits', lang)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.items?.map((item: TripItem, idx: number) => (
                        <tr key={idx} className="avoid-break">
                          <td className="font-mono text-xs font-bold text-deep-teal">
                            {item.time || '—'}
                          </td>
                          <td>
                            <span className="font-semibold text-text-main block">{item.title}</span>
                            {item.travelToNextMinutes && item.travelToNextMinutes > 0 && (
                              <span className="text-[8.5pt] text-muted-text italic block mt-0.5">
                                ↓ approx. {item.travelToNextMinutes} mins transit to next stop
                              </span>
                            )}
                          </td>
                          <td className="text-xs text-muted-text">
                            {item.durationMinutes ? `${item.durationMinutes} min` : '60 min'}
                          </td>
                          <td className="text-right font-semibold text-xs whitespace-nowrap">
                            {Number(item.estimatedCost) === 0 ? 'Free' : `₹${item.estimatedCost} est.`}
                          </td>
                          <td className="text-[9pt] text-muted-text leading-snug">
                            {item.reason || 'Curated recommendation for your travel schedule.'}
                          </td>
                        </tr>
                      ))}
                      {/* Day Total Row */}
                      <tr className="bg-cream/40 font-bold border-t-2 border-[#D2DFD8]">
                        <td colSpan={3} className="text-deep-teal">
                          {getPdfString('day_total', lang)} (Day {day.dayNumber})
                        </td>
                        <td className="text-right text-deep-teal font-extrabold text-xs whitespace-nowrap">
                          ₹{dayCost.toLocaleString('en-IN')} (Estimated)
                        </td>
                        <td className="text-[8.5pt] text-muted-text italic">
                          Calculated from activities & entry estimates
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION: ROUTE MAP SKETCH & STOPS                              */}
        {/* ============================================================== */}
        {options.includeRouteMap && tripRoute && tripRoute.days.length > 0 && (
          <section className="avoid-break space-y-4 pt-3">
            <div className="border-b border-deep-teal pb-1 flex items-center justify-between">
              <h2 className="text-base font-bold text-deep-teal font-heading">
                {lang === 'kn' ? 'ಪ್ರವಾಸ ಮಾರ್ಗ ನಕ್ಷೆ' : 'Trip Route Map'}
              </h2>
              <span className="text-[9pt] text-muted-text italic">
                Route sketch, not to scale. Distances are approximate.
              </span>
            </div>

            <div className="rounded-xl border border-[#D2DFD8] bg-[#FAF8F2] overflow-hidden p-3">
              <RouteSketch
                days={tripRoute.days}
                activeDay="all"
                className="w-full h-64 border-none shadow-none"
                disclaimerText="Route sketch, not to scale. Distances are approximate."
              />
            </div>

            {tripRoute.days.map((day) => (
              <div key={day.dayNumber} className="avoid-break space-y-2">
                <h3 className="font-bold text-deep-teal text-xs font-heading">
                  Day {day.dayNumber} Route Segments
                </h3>
                <table className="w-full text-[9.5pt] border border-[#E2DFD3]">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">#</th>
                      <th>Stop Attraction</th>
                      <th className="w-28 text-right">To Next Stop</th>
                      <th className="w-32 text-right">Est. Transit Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.stops.map((stop, sIdx) => {
                      const nextStop = day.stops[sIdx + 1];
                      const distKm = nextStop ? haversineKm(stop, nextStop) : 0;
                      const mins = nextStop ? estimateMinutes(distKm, 'car') : 0;
                      return (
                        <tr key={stop.attractionId + sIdx}>
                          <td className="text-center font-bold text-deep-teal font-mono">
                            {stop.order}
                          </td>
                          <td>
                            <span className="font-semibold text-text-main block">{stop.name}</span>
                            <span className="text-[8pt] text-muted-text font-mono">
                              ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
                            </span>
                          </td>
                          <td className="text-right font-mono text-xs">
                            {nextStop ? `${distKm.toFixed(1)} km` : '— (Final stop)'}
                          </td>
                          <td className="text-right text-xs text-muted-text">
                            {nextStop ? `~${mins} min (car)` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="text-[8.5pt] text-muted-text italic text-center">
              Route sketch, not to scale. Distances are approximate.
            </p>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: COSTS SUMMARY                                       */}
        {/* ============================================================== */}
        {options.includeCosts && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-deep-teal pb-1">
              <h2 className="text-base font-bold text-deep-teal font-heading">
                {getPdfString('costs_summary', lang)}
              </h2>
            </div>

            <table className="w-full text-[10pt] border border-[#E2DFD3]">
              <thead>
                <tr>
                  <th>Schedule Item</th>
                  <th className="text-right">Estimated Cost (INR)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {trip.days.map((day: Day) => {
                  const dayCost = day.items?.reduce((s, it) => s + (Number(it.estimatedCost) || 0), 0) || 0;
                  return (
                    <tr key={day.dayNumber}>
                      <td className="font-semibold text-text-main">
                        Day {day.dayNumber}: {day.summary || trip.destination}
                      </td>
                      <td className="text-right font-mono font-semibold">
                        ₹{dayCost.toLocaleString('en-IN')}
                      </td>
                      <td className="text-xs text-muted-text">
                        {day.items?.length || 0} scheduled stops
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[#DCEFE5]/60 font-extrabold border-t-2 border-deep-teal text-deep-teal">
                  <td>{getPdfString('trip_total', lang)} (Estimated)</td>
                  <td className="text-right text-sm">
                    ₹{totalTripCost.toLocaleString('en-IN')}
                  </td>
                  <td className="text-[9pt] font-normal text-deep-teal">
                    Target budget: ₹{trip.estimatedBudget?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-[9pt] text-muted-text italic">
              * {getPdfString('costs_estimate_note', lang)}
            </p>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: TRAVEL OPTIONS (DEMO DATA)                           */}
        {/* ============================================================== */}
        {options.includeTravel && travelOptionsToPrint.length > 0 && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="flex items-center justify-between border-b border-deep-teal pb-1">
              <h2 className="text-base font-bold text-deep-teal font-heading">
                {getPdfString('travel_options', lang)}
              </h2>
              <span className="text-[9pt] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {getPdfString('demo_data_header', lang)}
              </span>
            </div>

            <table className="w-full text-[10pt] border border-[#E2DFD3]">
              <thead>
                <tr>
                  <th>Operator & Mode</th>
                  <th>Times</th>
                  <th>Duration</th>
                  <th className="text-right">Estimated Fare</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {travelOptionsToPrint.map((tr: TransportOption, idx: number) => (
                  <tr key={idx}>
                    <td className="font-semibold">
                      {tr.operator} <span className="text-[8.5pt] text-muted-text">({tr.typeTag})</span>
                    </td>
                    <td className="font-mono text-xs">
                      {tr.departureTime} → {tr.arrivalTime}
                    </td>
                    <td className="text-xs text-muted-text">{tr.duration}</td>
                    <td className="text-right font-semibold text-xs whitespace-nowrap">
                      ₹{tr.estimatedPrice} est.
                    </td>
                    <td className="text-xs">
                      {tr.isShaktiEligible ? (
                        <span className="text-deep-teal font-semibold">Shakti Eligible (Karnataka Domicile)</span>
                      ) : (
                        tr.stopsText
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[9pt] text-amber-900 flex items-center space-x-2">
              <Info size={14} className="shrink-0 text-amber-800" />
              <span>
                <strong>Karnataka Shakti Scheme:</strong> {getPdfString('shakti_line', lang)}. (Note: Booking is never confirmed inside this plan).
              </span>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: PLAN B CHANGES (IF APPLIED)                         */}
        {/* ============================================================== */}
        {options.includePlanB && appliedPlanBList.length > 0 && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-terracotta pb-1 flex items-center space-x-2">
              <h2 className="text-base font-bold text-terracotta font-heading">
                {getPdfString('plan_b_changes', lang)}
              </h2>
              <span className="text-[9pt] text-terracotta font-semibold">(Simulated Contingency)</span>
            </div>

            <div className="space-y-3">
              {appliedPlanBList.map((rec, i) => (
                <div key={i} className="p-3.5 bg-terracotta/5 border border-terracotta/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-terracotta">
                    <span>
                      Day {rec.dayNumber} changed because of {rec.condition} (simulated)
                    </span>
                    <span>
                      ₹{rec.budgetBefore} est. → ₹{rec.budgetAfter} est.
                    </span>
                  </div>
                  <p className="text-xs text-muted-text">{rec.summary}</p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-text-main pt-1">
                    {rec.changes?.map((ch, cIdx) => (
                      <li key={cIdx}>{ch}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: SWARA PLAYLIST                                      */}
        {/* ============================================================== */}
        {options.includePlaylist && swaraPlaylistData && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-deep-teal pb-1 flex items-baseline justify-between">
              <div>
                <h2 className="text-base font-bold text-deep-teal font-heading">
                  {swaraPlaylistData.name}
                </h2>
                <span className="text-xs text-muted-text italic">
                  {getPdfString('swara_by', lang)} · {swaraPlaylistData.tagline}
                </span>
              </div>
            </div>

            {swaraPlaylistData.phases.map((phase, pIdx) => (
              <div key={pIdx} className="song-group avoid-break space-y-1.5">
                <h4 className="text-xs font-bold text-deep-teal uppercase tracking-wider">
                  {phase.phaseName}
                </h4>
                <table className="w-full text-[9.5pt] border border-[#E2DFD3]">
                  <thead>
                    <tr>
                      <th className="w-1/4">Title</th>
                      <th className="w-1/4">Artist</th>
                      <th className="w-1/5">Film</th>
                      <th className="w-16">Language</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phase.songs.map((song, sIdx) => (
                      <tr key={sIdx}>
                        <td className="font-semibold text-text-main">
                          {song.title}
                          {song.isPlaceSong && (
                            <span className="ml-1.5 text-[8pt] font-bold bg-mint text-deep-teal px-1.5 py-0.5 rounded-full inline-block">
                              {getPdfString('place_song', lang)}
                            </span>
                          )}
                        </td>
                        <td className="text-xs text-muted-text">{song.artist}</td>
                        <td className="text-xs text-muted-text">{song.film}</td>
                        <td className="text-xs">{song.language}</td>
                        <td className="text-[8.5pt] text-muted-text leading-snug">{song.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

            <p className="text-[8.5pt] text-muted-text italic">
              * {getPdfString('swara_catalog_note', lang)} (No lyrics or audio streams included).
            </p>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: KANNADA PHRASES                                     */}
        {/* ============================================================== */}
        {options.includePhrases && phrasesToPrint.length > 0 && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-deep-teal pb-1">
              <h2 className="text-base font-bold text-deep-teal font-heading">
                {getPdfString('kannada_phrases', lang)}
              </h2>
            </div>

            <table className="w-full text-[10pt] border border-[#E2DFD3]">
              <thead>
                <tr>
                  <th className="w-1/3">ಕನ್ನಡ (Kannada)</th>
                  <th className="w-1/4">English Meaning</th>
                  <th className="w-1/4">Pronunciation</th>
                  <th>Situation</th>
                </tr>
              </thead>
              <tbody>
                {phrasesToPrint.map((phrase, idx) => (
                  <tr key={idx} className="avoid-break">
                    <td className="kannada-text font-bold text-deep-teal select-text">
                      {phrase.kannada}
                    </td>
                    <td className="font-medium text-xs text-text-main">
                      {phrase.english}
                    </td>
                    <td className="font-mono text-xs text-muted-text">
                      {phrase.pronunciation}
                    </td>
                    <td className="text-[9pt] text-muted-text">
                      {phrase.situation}
                      {phrase.isAiGenerated && (
                        <span className="block text-[8pt] text-terracotta mt-0.5">
                          {getPdfString('ai_generated_phrases_note', lang)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 7: CULTURE NOTES                                       */}
        {/* ============================================================== */}
        {options.includeCulture && cultureNotesToPrint.length > 0 && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-deep-teal pb-1">
              <h2 className="text-base font-bold text-deep-teal font-heading">
                {getPdfString('culture_notes', lang)}
              </h2>
            </div>

            <div className="space-y-2.5">
              {cultureNotesToPrint.map((item, idx) => (
                <div key={idx} className="culture-qa-item avoid-break p-3.5 bg-cream/40 rounded-xl border border-[#E2DFD3] space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-deep-teal">
                      Q: {item.question}
                    </h4>
                    <span className="text-[8pt] font-semibold text-primary-teal uppercase shrink-0 bg-mint px-2 py-0.5 rounded-full">
                      Confidence: {item.confidence}
                    </span>
                  </div>
                  <p className="text-[9.5pt] text-text-main leading-relaxed pl-2 border-l-2 border-primary-teal">
                    {item.answer}
                  </p>
                  <span className="text-[8pt] text-muted-text italic block mt-1">
                    * {getPdfString('culture_verify_note', lang)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 8: EMERGENCY AND SAFETY INFO                           */}
        {/* ============================================================== */}
        {options.includeEmergency && (
          <section className="avoid-break space-y-3 pt-3">
            <div className="border-b border-rose-300 pb-1">
              <h2 className="text-base font-bold text-rose-800 font-heading">
                {getPdfString('emergency_safety', lang)}
              </h2>
            </div>

            <table className="w-full text-[10pt] border border-[#E2DFD3]">
              <thead>
                <tr>
                  <th className="bg-rose-100 text-rose-900 w-1/3">Emergency Service</th>
                  <th className="bg-rose-100 text-rose-900 w-1/4">Number</th>
                  <th className="bg-rose-100 text-rose-900">Guidance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-rose-900">
                    {getPdfString('emergency_112', lang)}
                  </td>
                  <td className="font-mono font-bold text-rose-700 text-sm">
                    112
                  </td>
                  <td className="text-xs text-muted-text">
                    <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                      {getPdfString('verify_locally', lang)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold text-text-main">
                    Local police, Ambulance, Tourist helpline
                  </td>
                  <td className="font-mono text-xs text-muted-text">
                    Check number locally
                  </td>
                  <td className="text-xs text-muted-text">
                    {getPdfString('generic_emergency_note', lang)}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* ============================================================== */}
        {/* FOOTER NOTE ON LAST PAGE                                       */}
        {/* ============================================================== */}
        <footer className="pt-6 border-t border-[#E2DFD3] text-center text-[8.5pt] text-muted-text leading-relaxed">
          <p>{getPdfString('footer_disclaimer', lang)}</p>
        </footer>

        {/* Running Footer Line (Fallback) */}
        <div className="print-running-footer">
          <span>Tiruga · {trip.title}</span>
          <span>{runtimeGeneratedDate}</span>
        </div>

      </div>
    </div>
  );
};
