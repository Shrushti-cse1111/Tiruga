import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  MapPin,
  Languages,
  WifiOff,
  Compass,
  ArrowRight,
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  Card,
  Button,
  Chip,
  SectionHeader,
  DestinationCard,
  LoadingSkeleton,
  EmptyState,
  ImageWithFallback
} from '../../components/common/CommonComponents';
import { getDestinations, DestinationItem as Destination } from '../../lib/db';
import { getPreferences } from '../../lib/preferences';
import { useAuth } from '../../lib/auth';
import { apiClient } from '../../api/client';
import { Trip } from '../../../shared/types';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  const [destinationsError, setDestinationsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [lastTrip, setLastTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState<boolean>(true);

  // Categories for horizontal chips
  const categories = ['All', 'Heritage', 'Nature', 'Food', 'Adventure', 'Beaches'];

  // User Display Info
  const userGreetingName = user?.displayName?.split(' ')[0] || 'Traveller';
  const userInitial = (user?.displayName?.[0] || 'T').toUpperCase();

  // 1. Load Destinations via getDestinations() with error handling
  const loadDestinationsData = async () => {
    setIsLoadingDestinations(true);
    setDestinationsError(null);
    try {
      const data = await getDestinations();
      setDestinations(data);
    } catch (err) {
      console.error('Failed to load destinations:', err);
      setDestinationsError('Unable to load recommended destinations. Please try again.');
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  // 2. Load latest saved trip if any exists
  const loadLatestTrip = async () => {
    setIsLoadingTrip(true);
    try {
      const trips = await apiClient.getTrips();
      if (trips && trips.length > 0) {
        // Find most recently updated or first trip
        setLastTrip(trips[0]);
      } else {
        setLastTrip(null);
      }
    } catch (err) {
      console.warn('Trips load fallback:', err);
      setLastTrip(null);
    } finally {
      setIsLoadingTrip(false);
    }
  };

  useEffect(() => {
    loadDestinationsData();
    loadLatestTrip();
  }, []);

  // 3. Personalize and Filter Destinations based on search, category & saved onboarding preferences
  const filteredDestinations = useMemo(() => {
    const prefs = getPreferences();
    const userInterests = prefs.interests || [];

    // Filter by category and search
    let list = destinations.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.categories.includes(selectedCategory as any);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.categories.some((c: string) => c.toLowerCase().includes(query)) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    // Personalize order: boost destinations matching user's onboarding preferences
    if (userInterests.length > 0) {
      list = [...list].sort((a, b) => {
        const aScore = a.categories.filter((c: string) => userInterests.includes(c)).length;
        const bScore = b.categories.filter((c: string) => userInterests.includes(c)).length;
        return bScore - aScore;
      });
    }

    return list;
  }, [destinations, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-cream text-text-main p-4 sm:p-5 pb-24 space-y-5 select-none">
      {/* 1. Top Row: Greeting with Kannada "ನಮಸ್ಕಾರ" Accent + Avatar */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-primary-teal font-semibold tracking-wide">
            <span className="font-kannada text-sm">ನಮಸ್ಕಾರ</span>
            <span>·</span>
            <span>Karnataka</span>
          </div>
          <h1 className="text-2xl font-bold text-deep-teal tracking-tight">
            Namaskara, {userGreetingName}
          </h1>
          <p className="text-xs text-muted-text mt-0.5">Where would you like to travel today?</p>
        </div>

        {/* Circular Avatar with Initials Fallback */}
        <div
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          className="w-11 h-11 rounded-full bg-deep-teal text-white flex items-center justify-center font-bold text-base shadow-sm border-2 border-white cursor-pointer hover:bg-primary-teal transition-colors"
          aria-label="User Profile"
        >
          {userInitial}
        </div>
      </header>

      {/* 2. Large Hero Card: "Plan a Karnataka Trip with AI" */}
      <div className="relative rounded-3xl overflow-hidden bg-deep-teal text-white shadow-md border border-deep-teal/40">
        {/* Background Hampi/Gokarna Imagery with Gradient */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600100397608-f010f443b74e?auto=format&fit=crop&w=1000&q=80"
            alt="Hampi Sunset"
            aspectRatio="aspect-[16/9]"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-teal via-deep-teal/90 to-deep-teal/60" />
        </div>

        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between min-h-[170px]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-gold text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-gold" />
              <span>AI Trip Planner</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              Plan a Karnataka Trip with AI
            </h2>
            <p className="text-xs sm:text-sm text-cream/90 mt-1 max-w-xs leading-relaxed">
              Tell us your vibe, we build your itinerary
            </p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-gold text-deep-teal hover:bg-white transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98]"
            >
              <span>Plan with AI</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Destination Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations (Hampi, Coorg, Gokarna...)"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-[#E2DFD3] text-sm text-text-main placeholder:text-muted-text/70 focus:outline-primary-teal focus:border-primary-teal shadow-2xs transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-text hover:text-text-main py-1 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Category Chips (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          />
        ))}
      </div>

      {/* 5. Quick Tiles (3 Equal Rounded Tiles) */}
      <div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {/* Tile 1: Kannada Companion */}
          <button
            type="button"
            onClick={() => navigate('/kannada')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E2DFD3] text-center hover:bg-mint/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-mint text-deep-teal flex items-center justify-center mb-1.5">
              <Languages size={18} />
            </div>
            <span className="text-xs font-bold text-deep-teal leading-tight">Kannada</span>
            <span className="text-[10px] text-muted-text font-kannada">ಸಹಾಯಕ</span>
          </button>

          {/* Tile 2: Nearby */}
          <button
            type="button"
            onClick={() => navigate('/nearby')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E2DFD3] text-center hover:bg-mint/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-mint text-deep-teal flex items-center justify-center mb-1.5">
              <MapPin size={18} />
            </div>
            <span className="text-xs font-bold text-deep-teal leading-tight">Nearby</span>
            <span className="text-[10px] text-muted-text">Attractions</span>
          </button>

          {/* Tile 3: Offline Trip */}
          <button
            type="button"
            onClick={() => navigate('/trip/current/offline')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-[#E2DFD3] text-center hover:bg-mint/40 active:scale-[0.98] transition-all cursor-pointer shadow-xs min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-xl bg-mint text-deep-teal flex items-center justify-center mb-1.5">
              <WifiOff size={18} />
            </div>
            <span className="text-xs font-bold text-deep-teal leading-tight">Offline Trip</span>
            <span className="text-[10px] text-muted-text">Zero Network</span>
          </button>
        </div>
      </div>

      {/* 6. "Continue Trip" Card */}
      <div>
        <SectionHeader
          title="Continue Trip"
          kannadaTitle="ಮುಂದುವರೆಸಿ"
          actionText={lastTrip ? 'View all' : undefined}
          onAction={() => navigate('/saved')}
        />

        {isLoadingTrip ? (
          <div className="rounded-2xl border border-[#E2DFD3] bg-white p-4 animate-pulse">
            <div className="h-4 bg-mint/50 rounded-md w-1/3 mb-2" />
            <div className="h-3 bg-mint/30 rounded-md w-1/2" />
          </div>
        ) : lastTrip ? (
          <div
            onClick={() => navigate(`/trip/${lastTrip.id}`)}
            role="button"
            tabIndex={0}
            className="rounded-2xl bg-white border border-[#E2DFD3] p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-mint shrink-0 image-fallback-gradient flex items-center justify-center text-white">
              <Compass size={24} className="text-gold" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-teal block">
                Active Itinerary
              </span>
              <h3 className="font-bold text-sm text-deep-teal truncate">{lastTrip.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-text mt-0.5">
                <span>{lastTrip.days} Days</span>
                <span>·</span>
                <span className="font-semibold text-text-main">
                  ₹{(lastTrip.est_total_inr || lastTrip.budget_inr || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 rounded-full bg-mint text-deep-teal text-xs font-bold shrink-0 hover:bg-primary-teal hover:text-white transition-colors"
            >
              Resume
            </button>
          </div>
        ) : (
          <EmptyState
            title="No trips yet. Plan your first one."
            subtitle="Start with a quick 4-question onboarding to discover Karnataka's heritage and nature."
            actionText="Plan Trip"
            onAction={() => navigate('/onboarding')}
          />
        )}
      </div>

      {/* 7. "Recommended for you" Horizontal List of DestinationCards */}
      <div>
        <SectionHeader
          title="Recommended for you"
          subtitle="Curated by your travel preferences"
          kannadaTitle="ನಿಮಗಾಗಿ ಶಿಫಾರಸು"
        />

        {/* Error Banner if Loading Fails */}
        {destinationsError && (
          <div className="p-4 rounded-2xl bg-[#FDE8E8] border border-red-200 text-red-800 text-xs flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>{destinationsError}</span>
            </div>
            <button
              type="button"
              onClick={loadDestinationsData}
              className="flex items-center gap-1 font-bold underline hover:text-red-900 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoadingDestinations && <LoadingSkeleton count={3} />}

        {/* Destination Cards Carousel / Grid */}
        {!isLoadingDestinations && !destinationsError && (
          <div className="space-y-4">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onClick={() => navigate('/onboarding')}
              />
            ))}

            {filteredDestinations.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-text">
                No destinations match "{searchQuery}" under {selectedCategory}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
