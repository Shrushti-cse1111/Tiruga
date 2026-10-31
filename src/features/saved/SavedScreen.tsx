import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Calendar,
  Wallet,
  Compass,
  Trash2,
  Download,
  Navigation,
  Star,
  LogIn,
  X,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { Trip, Attraction } from '../../data/types';
import { SEED_HAMPI_TRIP } from '../../data/seedTrip';
import { SEED_ATTRACTIONS } from '../../data/seedAttractions';
import { hasOfflineTrip } from '../../lib/offlineStore';
import { useAuth } from '../../lib/auth';
import { useLanguage } from '../../lib/languageContext';
import { listTrips, deleteTrip, toggleSavedPlace, listSavedPlaces } from '../../lib/db';
import { DownloadPdfOptionsSheet } from '../../components/pdf/DownloadPdfOptionsSheet';
import {
  ImageWithFallback,
  Button,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

const STORAGE_SAVED_TRIPS_KEY = 'tiruga_saved_trips';
const STORAGE_SAVED_PLACES_KEY = 'tiruga_saved_places';
const STORAGE_SAVED_PLACES_OBJ = 'tiruga_saved_places_objects';

export const SavedScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'trips' | 'places'>('trips');
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [offlineStatusMap, setOfflineStatusMap] = useState<Record<string, boolean>>({});
  const [savedPlaces, setSavedPlaces] = useState<Attraction[]>([]);

  // Delete Trip Confirmation Modal
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  // Download Trip PDF Sheet Modal
  const [tripForPdf, setTripForPdf] = useState<Trip | null>(null);

  // Load Saved Trips & Places from localStorage
  useEffect(() => {
    // Trips
    let trips: Trip[] = [];
    try {
      const storedTrips = localStorage.getItem(STORAGE_SAVED_TRIPS_KEY);
      if (storedTrips) {
        trips = JSON.parse(storedTrips);
      } else {
        // Seed default saved trip for demonstration
        trips = [SEED_HAMPI_TRIP];
        localStorage.setItem(STORAGE_SAVED_TRIPS_KEY, JSON.stringify(trips));
      }
    } catch {
      trips = [SEED_HAMPI_TRIP];
    }
    setSavedTrips(trips);

    // Check offline availability for trips
    trips.forEach(async (tr) => {
      const isOff = await hasOfflineTrip(tr.id);
      setOfflineStatusMap((prev) => ({ ...prev, [tr.id]: isOff }));
    });

    // Places
    let places: Attraction[] = [];
    try {
      const storedPlaces = localStorage.getItem(STORAGE_SAVED_PLACES_OBJ);
      if (storedPlaces) {
        places = JSON.parse(storedPlaces);
      } else {
        // Seed first 2 attractions if empty
        places = SEED_ATTRACTIONS.slice(0, 2);
        localStorage.setItem(STORAGE_SAVED_PLACES_OBJ, JSON.stringify(places));
      }
    } catch {
      places = SEED_ATTRACTIONS.slice(0, 2);
    }
    setSavedPlaces(places);
  }, []);

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId, user?.uid).catch(() => {});
    const updated = savedTrips.filter((t) => t.id !== tripId);
    setSavedTrips(updated);
    setTripToDelete(null);
  };

  const handleUnsavePlace = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSavedPlace({ id: placeId }, user?.uid).catch(() => {});
    const updated = savedPlaces.filter((p) => p.id !== placeId);
    setSavedPlaces(updated);
  };

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      <div className="flex-1 p-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal">
            {t('saved.title')}
          </h1>
          <p className="text-xs text-muted-text">Bookmarked Karnataka itineraries & spots</p>
        </div>

        {/* Guest gentle sign-in prompt */}
        {(!user || isGuest) && (
          <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD3] shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <LogIn size={16} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-text-main">Sync across devices</div>
                <div className="text-[10px] text-muted-text">Sign in to keep your trips permanently</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-3 py-1.5 rounded-full bg-deep-teal hover:bg-primary-teal text-white text-xs font-bold transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Segmented Control: Trips & Places */}
        <div className="flex bg-[#EFECE2] p-1 rounded-full max-w-[240px]">
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trips'
                ? 'bg-deep-teal text-white shadow-xs'
                : 'text-muted-text hover:text-text-main'
            }`}
          >
            {t('saved.trips')} ({savedTrips.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-deep-teal text-white shadow-xs'
                : 'text-muted-text hover:text-text-main'
            }`}
          >
            {t('saved.places')} ({savedPlaces.length})
          </button>
        </div>

        {/* Section 1: Saved Trips */}
        {activeTab === 'trips' && (
          <div className="space-y-3 pt-1">
            {savedTrips.length === 0 ? (
              <EmptyState
                title="No saved trips yet"
                subtitle="Your customized Karnataka plans will appear here once saved."
                actionText="Create a Plan"
                onAction={() => navigate('/onboarding')}
              />
            ) : (
              savedTrips.map((trip) => {
                const isOffline = offlineStatusMap[trip.id];
                return (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/trip/${trip.id}`)}
                    className="bg-white rounded-2xl border border-[#E2DFD3] shadow-xs overflow-hidden cursor-pointer hover:border-primary-teal transition-all group"
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <ImageWithFallback
                        src={trip.heroImage}
                        alt={trip.destination}
                        aspectRatio="aspect-[16/9]"
                        fallbackTitle={trip.destination}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                        <div>
                          <h3 className="font-bold text-sm font-heading">{trip.title}</h3>
                          <p className="text-[11px] text-white/90">
                            {trip.totalDays} Days · ₹{trip.estimatedBudget.toLocaleString('en-IN')}
                          </p>
                        </div>

                        {/* Offline Mint Chip */}
                        {isOffline && (
                          <span className="text-[10px] font-bold bg-mint text-deep-teal px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-xs">
                            <Download size={10} />
                            <span>Offline</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between text-xs border-t border-[#F0ECE1]">
                      <span className="text-muted-text text-[11px]">Saved locally</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripForPdf(trip);
                          }}
                          aria-label="Download trip PDF"
                          title="Download trip PDF"
                          className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-mint/50 hover:bg-mint text-deep-teal font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <FileDown size={13} className="text-deep-teal" />
                          <span>PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTripToDelete(trip);
                          }}
                          aria-label="Delete saved trip"
                          className="text-terracotta hover:text-red-700 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Section 2: Saved Places */}
        {activeTab === 'places' && (
          <div className="space-y-3 pt-1">
            {savedPlaces.length === 0 ? (
              <EmptyState
                title="No saved places yet"
                subtitle="Explore nearby attractions and tap the bookmark icon to save places here."
                actionText="Explore Nearby"
                onAction={() => navigate('/nearby')}
              />
            ) : (
              savedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => navigate('/nearby')}
                  className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs hover:border-primary-teal transition-all flex items-center space-x-3 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E2DFD3]">
                    <ImageWithFallback
                      src={place.image}
                      alt={place.name}
                      aspectRatio="aspect-square"
                      fallbackTitle={place.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase text-primary-teal bg-mint px-2 py-0.5 rounded-full">
                      {place.category}
                    </span>
                    <h4 className="text-xs font-bold text-text-main mt-1 truncate">
                      {place.name}
                    </h4>
                    <p className="text-[10px] text-muted-text mt-0.5">
                      {place.distanceKm} km · {place.estimatedEntryFee === 0 ? 'Free' : `Rs ${place.estimatedEntryFee} est.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleUnsavePlace(place.id, e)}
                    aria-label="Remove saved place"
                    className="w-8 h-8 rounded-full bg-gold text-deep-teal flex items-center justify-center border border-gold hover:opacity-80 transition-opacity cursor-pointer shrink-0"
                  >
                    <Bookmark size={14} fill="#103F38" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Delete Confirmation Modal Sheet */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl border border-[#E2DFD3]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-100 text-terracotta flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <h3 className="font-bold text-base text-text-main">Delete Saved Trip?</h3>
            </div>

            <p className="text-xs text-muted-text leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-text-main">{tripToDelete.title}</span> from your saved trips? This will also clear any offline cached files for this trip.
            </p>

            <div className="flex space-x-3 pt-2">
              <Button
                variant="white"
                className="flex-1 text-xs"
                onClick={() => setTripToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs bg-terracotta hover:bg-terracotta/90 border-terracotta text-white"
                onClick={() => handleDeleteTrip(tripToDelete.id)}
              >
                Delete Trip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Download Trip PDF Sheet */}
      {tripForPdf && (
        <DownloadPdfOptionsSheet
          isOpen={!!tripForPdf}
          onClose={() => setTripForPdf(null)}
          trip={tripForPdf}
        />
      )}
    </div>
  );
};
