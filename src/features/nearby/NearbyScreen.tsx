import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  MapPin,
  Bookmark,
  Star,
  Navigation,
  Compass,
  X,
  Info
} from 'lucide-react';
import { Attraction } from '../../data/types';
import { getAttractions, getDestinations, DestinationItem } from '../../lib/db';
import {
  ImageWithFallback,
  LoadingSkeleton,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

const STORAGE_SAVED_PLACES_KEY = 'tiruga_saved_places';

export const NearbyScreen: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [activeDestinationId, setActiveDestinationId] = useState<string>('hampi');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPinAttraction, setSelectedPinAttraction] = useState<Attraction | null>(null);

  // Initialize saved places from localStorage
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_PLACES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    return new Set<string>();
  });

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 1. Load destinations catalog on mount
  useEffect(() => {
    let mounted = true;
    getDestinations()
      .then((dests) => {
        if (mounted) {
          setDestinations(dests);
        }
      })
      .catch((err) => {
        console.warn('Failed to load destinations', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Load attractions for active destination
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setSelectedPinAttraction(null);

    getAttractions(activeDestinationId)
      .then((data) => {
        if (mounted) {
          setAttractions(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setAttractions([]);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [activeDestinationId]);

  const currentDestination = useMemo(() => {
    return (
      destinations.find((d) => d.id === activeDestinationId) || {
        id: 'hampi',
        name: 'Hampi',
        kannadaName: 'ಹಂಪಿ'
      }
    );
  }, [destinations, activeDestinationId]);

  const handleToggleBookmark = (att: Attraction, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(att.id)) {
        next.delete(att.id);
      } else {
        next.add(att.id);
      }
      try {
        localStorage.setItem(STORAGE_SAVED_PLACES_KEY, JSON.stringify(Array.from(next)));
        // Also save whole object array for saved tab
        const savedObjectsStr = localStorage.getItem('tiruga_saved_places_objects') || '[]';
        let savedObjects = JSON.parse(savedObjectsStr);
        if (next.has(att.id)) {
          if (!savedObjects.some((p: any) => p.id === att.id)) {
            savedObjects.push(att);
          }
        } else {
          savedObjects = savedObjects.filter((p: any) => p.id !== att.id);
        }
        localStorage.setItem('tiruga_saved_places_objects', JSON.stringify(savedObjects));

        // TODO: replace with server call / Firestore users/{uid}/savedPlaces
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }
      return next;
    });
  };

  const filteredAttractions = useMemo(() => {
    return attractions.filter((att) => {
      const matchesSearch =
        att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (att.kannadaName && att.kannadaName.includes(searchQuery));

      const matchesCat =
        selectedCategory === 'All' ||
        att.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [attractions, searchQuery, selectedCategory]);

  const scrollToCard = (attractionId: string) => {
    const el = cardRefs.current[attractionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-primary-teal');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-primary-teal');
      }, 1500);
    }
  };

  const getPinColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'temples':
        return '#D86D2D'; // terracotta
      case 'nature':
        return '#146B5B'; // primary teal
      case 'food':
        return '#F4B63E'; // gold
      case 'stays':
        return '#103F38'; // deep teal
      case 'heritage':
        return '#103F38'; // deep teal
      default:
        return '#146B5B';
    }
  };

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      <div className="flex-1 p-4 space-y-4">
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
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal truncate">
              Nearby Attractions
            </h1>
            <p className="text-xs text-muted-text">
              Within 10 km of your {currentDestination.name} itinerary
            </p>
          </div>
        </div>

        {/* 2. Destination Selector Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[11px] font-bold text-muted-text uppercase tracking-wider">
              Active Destination
            </span>
            <span className="text-[11px] font-kannada text-primary-teal font-semibold">
              {currentDestination.kannadaName || (currentDestination as any).nameKn}
            </span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {(destinations.length > 0
              ? destinations
              : [
                  { id: 'hampi', name: 'Hampi', kannadaName: 'ಹಂಪಿ' },
                  { id: 'mysuru', name: 'Mysuru', kannadaName: 'ಮೈಸೂರು' },
                  { id: 'coorg', name: 'Coorg', kannadaName: 'ಕೊಡಗು' },
                  { id: 'gokarna', name: 'Gokarna', kannadaName: 'ಗೋಕರ್ಣ' },
                  { id: 'chikmagalur', name: 'Chikmagalur', kannadaName: 'ಚಿಕ್ಕಮಗಳೂರು' },
                  { id: 'udupi', name: 'Udupi', kannadaName: 'ಉಡುಪಿ' },
                  { id: 'badami', name: 'Badami', kannadaName: 'ಬಾದಾಮಿ' },
                  { id: 'pattadakal', name: 'Pattadakal', kannadaName: 'ಪಟ್ಟದಕಲ್ಲು' },
                  { id: 'aihole', name: 'Aihole', kannadaName: 'ಐಹೊಳೆ' },
                  { id: 'sakleshpur', name: 'Sakleshpur', kannadaName: 'ಸಕಲೇಶಪುರ' },
                  { id: 'kudremukh', name: 'Kudremukh', kannadaName: 'ಕುದುರೆಮುಖ' },
                  { id: 'murudeshwar', name: 'Murudeshwar', kannadaName: 'ಮುರುಡೇಶ್ವರ' },
                  { id: 'srirangapatna', name: 'Srirangapatna', kannadaName: 'ಶ್ರೀರಂಗಪಟ್ಟಣ' },
                  { id: 'bengaluru', name: 'Bengaluru', kannadaName: 'ಬೆಂಗಳೂರು' },
                  { id: 'shivamogga', name: 'Shivamogga', kannadaName: 'ಶಿವಮೊಗ್ಗ' }
                ]
            ).map((d) => {
              const isSelected = activeDestinationId === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setActiveDestinationId(d.id);
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-deep-teal text-white shadow-xs'
                      : 'bg-white text-muted-text border border-[#E2DFD3] hover:text-text-main hover:bg-[#F9F7F1]'
                  }`}
                >
                  <span>{d.name}</span>
                  {d.kannadaName && (
                    <span className={`text-[10px] font-kannada font-normal ml-1 opacity-80`}>
                      {d.kannadaName}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentDestination.name} attractions, temples, spots...`}
              className="w-full bg-white border border-[#E2DFD3] rounded-full pl-9 pr-4 py-2.5 text-xs text-text-main placeholder:text-muted-text focus:outline-primary-teal shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-text-main cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Temples', 'Heritage', 'Nature', 'Food', 'Stays'].map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-deep-teal text-white shadow-xs'
                      : 'bg-white text-muted-text border border-[#E2DFD3] hover:text-text-main'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Styled SVG Map (Height ~260px, rounded 20px) */}
        <div className="relative h-[260px] w-full rounded-[20px] overflow-hidden border-2 border-[#D8D4C5] shadow-xs select-none bg-[#F5F1E6]">
          {/* Background SVG Canvas */}
          <svg
            className="w-full h-full cursor-pointer"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            onClick={() => setSelectedPinAttraction(null)}
          >
            {activeDestinationId === 'hampi' ? (
              <>
                {/* Hampi Original Exact SVG Artwork */}
                <path
                  d="M0,0 L100,0 L100,25 Q70,40 40,25 Q15,15 0,35 Z"
                  fill="#EBF4EE"
                  opacity="0.8"
                />
                <path
                  d="M0,70 Q25,85 60,75 Q85,70 100,85 L100,100 L0,100 Z"
                  fill="#EBF4EE"
                  opacity="0.8"
                />

                {/* Hill clusters (Granite boulders) */}
                <circle cx="85" cy="20" r="12" fill="#DFD9C7" opacity="0.6" />
                <circle cx="78" cy="18" r="9" fill="#D5CDBC" opacity="0.5" />
                <circle cx="20" cy="80" r="14" fill="#DFD9C7" opacity="0.6" />

                {/* Tungabhadra River Path */}
                <path
                  d="M0,45 Q20,38 45,46 T85,38 T100,42"
                  fill="none"
                  stroke="#B3D7D0"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M0,45 Q20,38 45,46 T85,38 T100,42"
                  fill="none"
                  stroke="#98C7BD"
                  strokeWidth="2"
                  strokeDasharray="2,3"
                />

                {/* Connecting Roads */}
                <path
                  d="M15,95 Q35,55 50,50 T80,30"
                  fill="none"
                  stroke="#D8D0BC"
                  strokeWidth="2.5"
                  strokeDasharray="1.5,1.5"
                />
                <path
                  d="M48,50 L55,75 L70,68"
                  fill="none"
                  stroke="#D8D0BC"
                  strokeWidth="2"
                />

                {/* Zone Labels */}
                <text x="5" y="42" fill="#146B5B" fontSize="3.5" fontWeight="bold" opacity="0.7">
                  Tungabhadra River
                </text>
                <text x="65" y="15" fill="#8C7A60" fontSize="3" fontWeight="bold" opacity="0.8">
                  Anegundi Hills
                </text>
                <text x="15" y="94" fill="#8C7A60" fontSize="3" fontWeight="bold" opacity="0.8">
                  Hampi Sacred Zone
                </text>
              </>
            ) : (
              <>
                {/* Stylized Regional Topographic Map Canvas for other destinations */}
                <path
                  d="M0,0 L100,0 L100,30 Q60,50 30,20 Q10,10 0,40 Z"
                  fill="#EBF4EE"
                  opacity="0.85"
                />
                <path
                  d="M0,65 Q30,80 65,70 Q85,65 100,80 L100,100 L0,100 Z"
                  fill="#EBF4EE"
                  opacity="0.85"
                />

                {/* Terrain Hill / Contour Shading */}
                <circle cx="82" cy="22" r="14" fill="#DFD9C7" opacity="0.5" />
                <circle cx="18" cy="82" r="16" fill="#DFD9C7" opacity="0.5" />

                {/* Waterbody or River Curve */}
                <path
                  d="M0,50 Q30,35 60,52 T100,46"
                  fill="none"
                  stroke="#B3D7D0"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M0,50 Q30,35 60,52 T100,46"
                  fill="none"
                  stroke="#98C7BD"
                  strokeWidth="1.8"
                  strokeDasharray="2,3"
                />

                {/* Regional Scenic Trails */}
                <path
                  d="M20,90 Q40,60 55,50 T85,25"
                  fill="none"
                  stroke="#D8D0BC"
                  strokeWidth="2.5"
                  strokeDasharray="2,2"
                />
                <path
                  d="M50,52 L60,78 L75,70"
                  fill="none"
                  stroke="#D8D0BC"
                  strokeWidth="2"
                />

                {/* Regional Zone Label */}
                <text x="8" y="44" fill="#146B5B" fontSize="3.5" fontWeight="bold" opacity="0.7">
                  {currentDestination.name} Region
                </text>
                <text x="60" y="16" fill="#8C7A60" fontSize="3.2" fontWeight="bold" opacity="0.8">
                  {currentDestination.kannadaName || (currentDestination as any).nameKn || ''}
                </text>
              </>
            )}

            {/* Compass */}
            <g transform="translate(90, 88)">
              <circle cx="0" cy="0" r="6" fill="#FFFFFF" opacity="0.9" stroke="#E2DFD3" strokeWidth="0.5" />
              <text x="0" y="-1.5" fill="#103F38" fontSize="3" fontWeight="bold" textAnchor="middle">
                N
              </text>
              <polygon points="0,-4 1.5,-1 -1.5,-1" fill="#D86D2D" />
              <polygon points="0,4 1.5,1 -1.5,1" fill="#60736E" />
            </g>
          </svg>

          {/* Pulsing "You are here" Blue Dot */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
            style={{
              left: activeDestinationId === 'hampi' ? '30%' : '50%',
              top: activeDestinationId === 'hampi' ? '48%' : '52%'
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-xs" />
            </div>
          </div>

          {/* Attraction Pins (Filtered by search and category) */}
          {filteredAttractions.map((att) => {
            const isSelected = selectedPinAttraction?.id === att.id;
            const pinColor = getPinColor(att.category);
            const posX = (att as any).mapX ?? att.coordinates?.x ?? 50;
            const posY = (att as any).mapY ?? att.coordinates?.y ?? 50;

            return (
              <button
                key={att.id}
                type="button"
                aria-label={`View ${att.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPinAttraction(att);
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center z-20 cursor-pointer focus:outline-none"
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`
                }}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                    isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: pinColor }}
                >
                  <MapPin size={14} className="text-white" />
                </div>
              </button>
            );
          })}

          {/* Floating Popup above/on Pin Tap */}
          {selectedPinAttraction && (
            <div
              className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-[#E2DFD3] z-30 animate-fade-in flex items-center justify-between space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E2DFD3]">
                  <ImageWithFallback
                    src={selectedPinAttraction.image}
                    alt={selectedPinAttraction.name}
                    aspectRatio="aspect-square"
                    fallbackTitle={selectedPinAttraction.name}
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary-teal">
                    {selectedPinAttraction.category}
                  </span>
                  <h4 className="text-xs font-bold text-text-main truncate">
                    {selectedPinAttraction.name}
                  </h4>
                  <p className="text-[10px] text-muted-text flex items-center mt-0.5">
                    <Navigation size={10} className="mr-1 text-primary-teal" />
                    {selectedPinAttraction.distanceKm ?? 1.5} km · ~{selectedPinAttraction.approxMinutes ?? (selectedPinAttraction as any).durationMinutes ?? 15} min (approx.)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollToCard(selectedPinAttraction.id)}
                  className="px-3 py-1.5 rounded-full bg-deep-teal hover:bg-primary-teal text-white text-[11px] font-bold cursor-pointer transition-colors"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPinAttraction(null)}
                  aria-label="Close preview"
                  className="w-7 h-7 rounded-full bg-cream flex items-center justify-center text-muted-text hover:text-text-main cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Caption under the map */}
        <p className="text-[11px] text-muted-text text-center italic">
          Map is illustrative. Distances and coordinates are approximate estimates.
        </p>

        {/* 6. Attraction Cards List */}
        <div className="space-y-3 pt-1">
          {isLoading ? (
            <LoadingSkeleton count={3} />
          ) : filteredAttractions.length === 0 ? (
            <EmptyState
              title="No attractions found"
              subtitle={`No attractions found for this filter in ${currentDestination.name}. Try another category or search term.`}
              actionText="Reset Search"
              onAction={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            />
          ) : (
            filteredAttractions.map((att) => {
              const isSaved = savedIds.has(att.id);
              const isHighlighted = selectedPinAttraction?.id === att.id;
              const fee = (att as any).estimatedCost ?? att.estimatedEntryFee ?? 0;
              const duration = att.approxMinutes ?? (att as any).durationMinutes ?? 30;

              return (
                <div
                  key={att.id}
                  ref={(el) => {
                    cardRefs.current[att.id] = el;
                  }}
                  onClick={() => setSelectedPinAttraction(att)}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs space-y-2.5 ${
                    isHighlighted
                      ? 'border-2 border-primary-teal shadow-md bg-mint/10'
                      : 'border-[#E2DFD3] hover:border-primary-teal'
                  }`}
                >
                  <div className="flex space-x-3">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-[#E2DFD3]">
                      <ImageWithFallback
                        src={att.image}
                        alt={att.name}
                        aspectRatio="aspect-square"
                        fallbackTitle={att.name}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              <span className="text-[10px] font-bold text-primary-teal bg-mint px-2 py-0.5 rounded-full">
                                {att.category}
                              </span>
                              {((att as any).indoor || att.isIndoor) && (
                                <span className="text-[9px] font-semibold text-[#103F38] bg-[#E2DFD3]/60 px-1.5 py-0.5 rounded-full">
                                  Sheltered/Indoor
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-text-main mt-1 leading-snug">
                              {att.name}
                            </h3>
                            {att.kannadaName && (
                              <p className="text-[11px] text-muted-text font-kannada">
                                {att.kannadaName}
                              </p>
                            )}
                          </div>

                          {/* Bookmark Toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmark(att, e)}
                            aria-label={`Save ${att.name}`}
                            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                              isSaved
                                ? 'bg-gold text-deep-teal border-gold'
                                : 'bg-cream text-muted-text border-[#E2DFD3] hover:text-text-main'
                            }`}
                          >
                            <Bookmark size={15} fill={isSaved ? '#103F38' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Distance & Rating */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F0ECE1]">
                        <span className="text-muted-text flex items-center">
                          <Navigation size={11} className="mr-1 text-primary-teal" />
                          {att.distanceKm ?? 1.5} km · ~{duration} min (approx.)
                        </span>

                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-deep-teal">
                            {fee === 0 ? 'Free' : `₹${fee} est.`}
                          </span>
                          {att.sampleRating && (
                            <span className="flex items-center text-amber-700 font-bold text-[10px]">
                              <Star size={11} className="text-gold fill-gold mr-0.5" />
                              {att.sampleRating} <span className="font-normal opacity-75 ml-0.5">(sample)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-text leading-relaxed line-clamp-2">
                    {att.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
