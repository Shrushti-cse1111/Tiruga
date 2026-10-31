import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Bus,
  Train,
  Car,
  Info,
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { TransportOption } from '../../data/types';
import { getTransport } from '../../lib/db';
import {
  Button,
  LoadingSkeleton,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

export const TravelScreen: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [origin, setOrigin] = useState<string>('Bengaluru');
  const [selectedDateOffset, setSelectedDateOffset] = useState<number>(1); // 1 = tomorrow
  const [activeTab, setActiveTab] = useState<'bus' | 'train' | 'cab'>('bus');
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Booking Modal State
  const [selectedBookingItem, setSelectedBookingItem] = useState<TransportOption | null>(null);

  // Dynamic date calculation at runtime (NEVER hard-coded)
  const formattedDate = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + selectedDateOffset);

    const formatter = new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    const prefix = selectedDateOffset === 1 ? 'Departing tomorrow, ' : 'Departing on ';
    return prefix + formatter.format(target);
  }, [selectedDateOffset]);

  // Load transport data
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getTransport(origin, 'Hampi', formattedDate)
      .then((data) => {
        if (mounted) {
          setTransportOptions(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setTransportOptions([]);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [origin, formattedDate]);

  const filteredOptions = useMemo(() => {
    return transportOptions.filter((opt) => opt.mode === activeTab);
  }, [transportOptions, activeTab]);

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      <div className="flex-1 p-4 space-y-4">
        {/* 1. Header */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-11 h-11 rounded-full bg-white border border-[#E2DFD3] flex items-center justify-center text-text-main hover:bg-[#F0ECE1] transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal">
              Travel Options
            </h1>
            <p className="text-xs text-muted-text">Intercity routes & schedules</p>
          </div>
        </div>

        {/* Route Selector */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD3] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-text">Route</span>
            <div className="flex items-center space-x-1.5">
              <label htmlFor="origin-select" className="text-xs text-muted-text font-medium">
                From:
              </label>
              <select
                id="origin-select"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="text-xs font-bold text-deep-teal bg-cream border border-[#E2DFD3] rounded-lg px-2 py-1 cursor-pointer focus:outline-primary-teal"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Hubballi">Hubballi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-text-main">{origin}</span>
              <span className="text-muted-text">→</span>
              <span className="text-sm font-bold text-deep-teal">Hampi (Hosapete)</span>
            </div>
            <span className="text-[11px] text-muted-text font-mono">~340 km</span>
          </div>
        </div>

        {/* 2. Date Picker Chip */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-[#E2DFD3] text-xs font-semibold text-text-main">
            <Calendar size={14} className="text-primary-teal" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex space-x-1 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedDateOffset(1)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedDateOffset === 1
                  ? 'bg-deep-teal text-white'
                  : 'bg-white text-muted-text border border-[#E2DFD3]'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setSelectedDateOffset(2)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedDateOffset === 2
                  ? 'bg-deep-teal text-white'
                  : 'bg-white text-muted-text border border-[#E2DFD3]'
              }`}
            >
              +2 Days
            </button>
          </div>
        </div>

        {/* 3. Segmented Control */}
        <div className="flex items-center justify-between">
          <div className="flex bg-[#EFECE2] p-1 rounded-full flex-1 max-w-[270px]">
            <button
              type="button"
              onClick={() => setActiveTab('bus')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'bus' ? 'bg-deep-teal text-white shadow-xs' : 'text-muted-text'
              }`}
            >
              <Bus size={13} />
              <span>Buses (4)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('train')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'train' ? 'bg-deep-teal text-white shadow-xs' : 'text-muted-text'
              }`}
            >
              <Train size={13} />
              <span>Trains (2)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cab')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                activeTab === 'cab' ? 'bg-deep-teal text-white shadow-xs' : 'text-muted-text'
              }`}
            >
              <Car size={13} />
              <span>Cabs (3)</span>
            </button>
          </div>

          <span className="text-[10px] font-bold text-amber-800 bg-gold/30 px-2 py-1 rounded-full border border-gold/40">
            Demo data — not live
          </span>
        </div>

        {/* 4. Shakti Scheme Highlight */}
        {activeTab === 'bus' && (
          <div className="bg-[#FAF3E9] p-4 rounded-2xl border border-terracotta/40 shadow-xs space-y-2">
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-terracotta tracking-wide uppercase">
                  Karnataka Shakti Scheme
                </h4>
                <p className="text-xs text-text-main mt-0.5 leading-relaxed">
                  Free bus travel for women with Karnataka domicile on non-AC state buses (KSRTC
                  ordinary, express, and NWKRTC/NEKRTC routes). Check official KSRTC counters or{' '}
                  <span className="underline font-mono text-[11px]">sevasindhu.karnataka.gov.in</span>.
                </p>
                <p className="text-[10px] text-muted-text mt-1.5 font-medium italic">
                  Demo display only. Tiruga does not issue Shakti passes or verify eligibility.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Transport Cards List */}
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : filteredOptions.length === 0 ? (
          <EmptyState
            title="No options found"
            subtitle={`No ${activeTab} routes available for ${origin} to Hampi on this date.`}
          />
        ) : (
          <div className="space-y-3 pt-1">
            {filteredOptions.map((opt) => (
              <div
                key={opt.id}
                className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs hover:border-primary-teal transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-text-main">{opt.operator}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[11px] font-medium text-muted-text">{opt.typeTag}</span>
                      <span className="text-[10px] text-muted-text">•</span>
                      <span className="text-[11px] text-muted-text">{opt.stopsText}</span>
                    </div>
                  </div>

                  {opt.isShaktiEligible && (
                    <span className="text-[10px] font-bold bg-mint text-deep-teal px-2 py-0.5 rounded-full border border-primary-teal/20">
                      Shakti eligible (Free for women)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE1]">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-sm font-extrabold text-primary-teal font-mono">
                        {opt.departureTime}
                      </div>
                      <div className="text-[10px] text-muted-text">{origin}</div>
                    </div>
                    <div className="text-center px-1">
                      <div className="text-[10px] text-muted-text">{opt.duration}</div>
                      <div className="w-12 h-0.5 bg-mint my-0.5" />
                      <div className="text-[9px] text-muted-text">{opt.stopsText}</div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-text-main font-mono">
                        {opt.arrivalTime}
                      </div>
                      <div className="text-[10px] text-muted-text">Hampi</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-deep-teal">
                      ₹{opt.estimatedPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-muted-text">estimated</div>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingItem(opt)}
                      className="mt-1.5 px-4 py-1.5 rounded-full bg-deep-teal hover:bg-primary-teal text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. Travel Tip Note */}
        <div className="bg-cream/80 border border-[#E2DFD3] p-3 rounded-2xl flex items-start space-x-2 text-xs text-muted-text">
          <Info size={15} className="text-primary-teal shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-text-main">Traveller Tip: </span>
            Weekend buses to Hampi fill quickly. Advance booking of 3–5 days recommended during
            October to February.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* 6. Booking Modal Sheet */}
      {selectedBookingItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
          <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] p-5 space-y-4 shadow-2xl border border-[#E2DFD3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <h3 className="font-bold text-base text-text-main">Booking Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingItem(null)}
                className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-text-main leading-relaxed">
              <div className="bg-cream p-3 rounded-2xl border border-[#E2DFD3]">
                <div className="font-bold text-deep-teal">{selectedBookingItem.operator}</div>
                <div className="text-muted-text mt-0.5">
                  {selectedBookingItem.typeTag} · Fare approx ₹{selectedBookingItem.estimatedPrice}
                </div>
              </div>

              <p>
                Booking is <span className="font-bold">not available</span> in this demo. Check
                official operator websites (such as{' '}
                <span className="font-semibold text-primary-teal">ksrtc.in</span>,{' '}
                <span className="font-semibold text-primary-teal">irctc.co.in</span>) or verified apps
                for live fares, seat charts, and confirmed seat availability.
              </p>
              <p className="text-[11px] text-muted-text">
                Tiruga never collects ticket payments or generates tickets directly.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={() => setSelectedBookingItem(null)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
