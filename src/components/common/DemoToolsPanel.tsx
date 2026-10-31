import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Sparkles, RefreshCcw, FileText, Check, AlertCircle, X } from 'lucide-react';
import demoTripData from '../../../data/demoTrip.json';
import { Trip } from '../../data/types';
import { saveTrip } from '../../lib/db';
import { useAuth } from '../../lib/auth';

export const DemoToolsPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1' || sessionStorage.getItem('tiruga_demo_mode') === 'true') {
      setIsDemoMode(true);
      sessionStorage.setItem('tiruga_demo_mode', 'true');
    }
  }, []);

  if (!isDemoMode) return null;

  const showFeedback = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // 1. Load backup itinerary from data/demoTrip.json
  const handleLoadBackupItinerary = async () => {
    try {
      const trip = demoTripData as unknown as Trip;
      await saveTrip(trip, user?.uid);
      showFeedback('Backup 3-Day Hampi itinerary loaded successfully!');
      setTimeout(() => {
        setIsOpen(false);
        navigate(`/trip/${trip.id}?demo=1`);
      }, 600);
    } catch (err: any) {
      showFeedback('Failed to load backup itinerary');
    }
  };

  // 2. Fill demo preferences: 3 days, Rs 7,000, Friends, Nature + Culture
  const handleFillDemoPreferences = () => {
    try {
      const demoPrefs = {
        days: 3,
        budget: '₹5,000 - ₹10,000',
        travelStyle: 'Friends',
        interests: ['Nature', 'Culture', 'Heritage'],
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('tiruga_prefs', JSON.stringify(demoPrefs));
      showFeedback('Demo preferences filled: 3 Days · Rs 7,000 · Friends · Nature + Culture');
      setTimeout(() => {
        setIsOpen(false);
        navigate('/plan?demo=1');
      }, 600);
    } catch (err) {
      showFeedback('Failed to pre-fill preferences');
    }
  };

  // 3. Reset demo data (with confirmation)
  const handleResetDemoData = () => {
    const confirmed = window.confirm(
      'Reset demo data?\nThis will clear local trips, bookmarks, downloaded offline packs, and reset demo state.\nShared catalog in Firestore will NOT be touched.'
    );
    if (!confirmed) return;

    try {
      localStorage.removeItem('tiruga_saved_trips');
      localStorage.removeItem('tiruga_saved_places');
      localStorage.removeItem('tiruga_saved_places_objects');
      localStorage.removeItem('tiruga_offline_trip');
      localStorage.removeItem('tiruga_prefs');
      showFeedback('Local demo data reset cleanly!');
      setTimeout(() => {
        window.location.href = '/?demo=1';
      }, 700);
    } catch {
      showFeedback('Reset encountered an issue');
    }
  };

  return (
    <>
      {/* Floating Demo Trigger Pill */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-gold text-deep-teal font-extrabold text-xs shadow-lg flex items-center space-x-1.5 border border-amber-300 hover:scale-105 transition-all cursor-pointer"
          title="Open Hackathon Demo Shortcuts"
        >
          <Sparkles size={14} className="text-deep-teal fill-deep-teal" />
          <span>Demo Tools</span>
        </button>
      </div>

      {/* Demo Modal Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl border border-[#E2DFD3] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DFD3] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-deep-teal">
                  <Wrench size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-main">3-Min Pitch Demo Tools</h3>
                  <p className="text-[11px] text-muted-text">Active via ?demo=1 query</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {message && (
              <div className="bg-mint text-deep-teal p-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-fade-in">
                <Check size={14} />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleLoadBackupItinerary}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-mint text-deep-teal font-bold text-xs flex items-center space-x-2.5 hover:bg-mint/80 transition-colors text-left cursor-pointer border border-primary-teal/20"
              >
                <FileText size={16} className="text-primary-teal shrink-0" />
                <div>
                  <div className="font-bold">Load Backup Itinerary</div>
                  <div className="text-[10px] text-muted-text font-normal">
                    Pre-generated Hampi (3 Days · Rs 7,000 · Friends)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleFillDemoPreferences}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-cream text-text-main font-bold text-xs flex items-center space-x-2.5 hover:bg-[#EAE6D8] transition-colors text-left cursor-pointer border border-[#E2DFD3]"
              >
                <Sparkles size={16} className="text-gold shrink-0" />
                <div>
                  <div className="font-bold">Fill Demo Preferences</div>
                  <div className="text-[10px] text-muted-text font-normal">
                    Pre-fills 3 days, ₹7,000, Friends, Nature + Culture
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleResetDemoData}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-white text-terracotta font-bold text-xs flex items-center space-x-2.5 hover:bg-red-50 transition-colors text-left cursor-pointer border border-red-200"
              >
                <RefreshCcw size={16} className="text-terracotta shrink-0" />
                <div>
                  <div className="font-bold">Reset Demo Data</div>
                  <div className="text-[10px] text-muted-text font-normal">
                    Clears local state (safe, preserves Firestore catalog)
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
