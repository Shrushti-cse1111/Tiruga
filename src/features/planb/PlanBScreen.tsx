import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CloudRain,
  Sun,
  Users,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Clock,
  Landmark,
  Utensils,
  Mountain,
  Info
} from 'lucide-react';
import { Trip, Day, TripItem } from '../../data/types';
import { getTrip } from '../../data/seedTrip';
import { generatePlanB } from '../../data/seedAttractions';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import { WifiOff } from 'lucide-react';
import {
  Button,
  LoadingSkeleton,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

export const PlanBScreen: React.FC = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  // State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [condition, setCondition] = useState<'Rain' | 'Heat' | 'Crowd'>('Rain');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [planBResult, setPlanBResult] = useState<{
    dayNumber: number;
    summary: string;
    items: TripItem[];
    changesExplained: string[];
  } | null>(null);

  const [previousDayBackup, setPreviousDayBackup] = useState<Day | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial trip
  useEffect(() => {
    getTrip('trip_hampi_3d').then((data) => {
      setTrip(data);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeDay = trip?.days.find((d) => d.dayNumber === selectedDayNumber) || trip?.days[0];

  // Condition simulated weather facts
  const weatherFacts = {
    Rain: {
      temp: '26°C',
      precip: '85%',
      headline: 'Heavy monsoon showers & boulder slip warning',
      summary: 'Afternoon thunderstorms expected in Hampi. Granite boulders turn treacherous.'
    },
    Heat: {
      temp: '41°C',
      precip: '0%',
      headline: 'Extreme boulder heat wave 11:30 AM – 3:30 PM',
      summary: 'Direct sun radiation on granite ruins exceeds 46°C surface heat.'
    },
    Crowd: {
      temp: '31°C',
      precip: '10%',
      headline: 'Festival weekend peak footfall (3x normal)',
      summary: 'Extended queues at Virupaksha main gopura and Vittala electric carts.'
    }
  };

  const handleGeneratePlanB = async () => {
    if (!activeDay) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await generatePlanB(activeDay, condition);
      setPlanBResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate Plan B. Original day preserved.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplaceDay = () => {
    if (!trip || !planBResult || !activeDay) return;

    // Save backup for undo
    setPreviousDayBackup(JSON.parse(JSON.stringify(activeDay)));

    const updatedDays = trip.days.map((d) =>
      d.dayNumber === planBResult.dayNumber
        ? {
            ...d,
            summary: planBResult.summary,
            items: planBResult.items
          }
        : d
    );

    setTrip({ ...trip, days: updatedDays });
    setCanUndo(true);
    showToast(`Day ${planBResult.dayNumber} updated to Plan B!`);
  };

  const handleUndo = () => {
    if (!trip || !previousDayBackup) return;

    const restoredDays = trip.days.map((d) =>
      d.dayNumber === previousDayBackup.dayNumber ? previousDayBackup : d
    );

    setTrip({ ...trip, days: restoredDays });
    setPreviousDayBackup(null);
    setCanUndo(false);
    showToast(`Original Day ${previousDayBackup.dayNumber} restored.`);
  };

  const originalCost = activeDay?.items.reduce((s, i) => s + i.estimatedCost, 0) || 0;
  const planBCost = planBResult?.items.reduce((s, i) => s + i.estimatedCost, 0) || 0;
  const costDiff = planBCost - originalCost;

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      {/* Toast Notification with Undo */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-deep-teal text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center space-x-3 animate-fade-in border border-white/20">
          <Check size={14} className="text-gold" />
          <span>{toastMessage}</span>
          {canUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="bg-white/20 hover:bg-white/30 text-gold px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

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
              Plan B & Weather
            </h1>
            <p className="text-xs text-muted-text">Adaptive itinerary when conditions change</p>
          </div>
        </div>

        {/* 2. Day Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-text-main">Select Day to Adapt</label>
          <div className="flex space-x-2">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  setSelectedDayNumber(num);
                  setPlanBResult(null);
                }}
                className={`flex-1 min-h-[44px] py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedDayNumber === num
                    ? 'bg-deep-teal text-white shadow-xs'
                    : 'bg-white text-muted-text border border-[#E2DFD3] hover:text-text-main'
                }`}
              >
                Day {num}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Condition Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-main">Simulated Condition</label>
            <span className="text-[10px] font-bold text-amber-800 bg-gold/30 px-2 py-0.5 rounded-full border border-gold/40">
              Simulated conditions — not real weather
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCondition('Rain');
                setPlanBResult(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                condition === 'Rain'
                  ? 'bg-mint/60 border-primary-teal text-deep-teal font-bold shadow-xs'
                  : 'bg-white border-[#E2DFD3] text-muted-text hover:text-text-main'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-teal shadow-2xs">
                <CloudRain size={18} />
              </div>
              <span className="text-xs">Heavy Rain</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCondition('Heat');
                setPlanBResult(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                condition === 'Heat'
                  ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs'
                  : 'bg-white border-[#E2DFD3] text-muted-text hover:text-text-main'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-2xs">
                <Sun size={18} />
              </div>
              <span className="text-xs">High Heat &gt;38°</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCondition('Crowd');
                setPlanBResult(null);
              }}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                condition === 'Crowd'
                  ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                  : 'bg-white border-[#E2DFD3] text-muted-text hover:text-text-main'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-2xs">
                <Users size={18} />
              </div>
              <span className="text-xs">Crowded / Queue</span>
            </button>
          </div>
        </div>

        {/* 4. Simulated Weather Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-text-main">
                {weatherFacts[condition].temp}
              </div>
              <div className="text-xs font-semibold text-primary-teal">
                Rain probability: {weatherFacts[condition].precip}
              </div>
            </div>
            <div className="text-right max-w-[200px]">
              <div className="text-xs font-bold text-text-main">
                {weatherFacts[condition].headline}
              </div>
              <div className="text-[11px] text-muted-text mt-0.5">
                {weatherFacts[condition].summary}
              </div>
            </div>
          </div>

          {/* Warm Terracotta Callout */}
          <div className="bg-[#FAF3E9] p-3 rounded-xl border border-terracotta/30 flex items-start space-x-2 text-xs">
            <Info size={16} className="text-terracotta shrink-0 mt-0.5" />
            <p className="text-text-main leading-relaxed">
              <span className="font-bold text-terracotta">Why Plan B? </span>
              Outdoor heritage sites become slippery or uncomfortably hot. Tiruga swaps exposed boulder
              climbs for shaded indoor galleries, museum halls, or cool viewpoints.
            </p>
          </div>
        </div>

        {/* 5. Generate Plan B Button */}
        <div className="space-y-1.5">
          <Button
            variant="primary"
            fullWidth
            size="md"
            disabled={!isOnline || isGenerating}
            onClick={handleGeneratePlanB}
            className={!isOnline ? 'opacity-50' : ''}
            title={!isOnline ? 'AI features need an internet connection.' : undefined}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating AI Plan B Adaptation...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles size={16} className="text-gold" />
                <span>Generate Plan B for Day {selectedDayNumber}</span>
              </div>
            )}
          </Button>

          {!isOnline && (
            <p className="text-[10px] text-terracotta text-center flex items-center justify-center pt-1 font-medium">
              <WifiOff size={11} className="mr-1" />
              AI features need an internet connection.
            </p>
          )}
        </div>

        {/* Error Alert (preserves original day) */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl text-xs text-rose-800 flex items-center space-x-2">
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6. Result View */}
        {planBResult && activeDay && (
          <div className="space-y-4 pt-1 animate-fade-in">
            {/* Suggested Changes Checklist */}
            <div className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs space-y-2.5">
              <h3 className="text-xs font-extrabold text-primary-teal uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 size={15} />
                <span>Suggested Changes ({planBResult.changesExplained.length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-text-main">
                {planBResult.changesExplained.map((exp, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-cream/70 p-2 rounded-xl">
                    <span className="text-terracotta font-bold">•</span>
                    <span className="leading-relaxed">{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Before / After Comparison Cards */}
            <div className="grid grid-cols-1 gap-3">
              {/* Original Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-[#E2DFD3] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-text">
                    Original Day {selectedDayNumber}
                  </span>
                  <span className="text-[11px] font-mono text-muted-text">₹{originalCost}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {activeDay.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 border-b border-[#F5F2EB] last:border-none"
                    >
                      <span className="text-muted-text">{item.title}</span>
                      <span className="text-muted-text font-mono text-[11px]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan B Card */}
              <div className="bg-[#F0F8F5] p-3.5 rounded-2xl border-2 border-primary-teal shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-deep-teal flex items-center space-x-1">
                    <Sparkles size={13} className="text-gold" />
                    <span>Plan B Day {selectedDayNumber}</span>
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-deep-teal font-mono">₹{planBCost}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        costDiff <= 0
                          ? 'bg-mint text-deep-teal'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {costDiff < 0
                        ? `₹${Math.abs(costDiff)} lower`
                        : costDiff === 0
                        ? 'Same cost'
                        : `+₹${costDiff}`}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {planBResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 bg-white/70 px-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-primary-teal font-bold text-[11px]">
                          {item.time}
                        </span>
                        <span className="font-medium text-text-main">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-text">
                        {item.estimatedCost === 0 ? 'Free' : `₹${item.estimatedCost}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Button
                variant="white"
                className="flex-1 text-xs"
                onClick={() => setPlanBResult(null)}
              >
                Keep Original
              </Button>
              <Button
                variant="primary"
                className="flex-1 text-xs"
                onClick={handleReplaceDay}
              >
                Replace Day {selectedDayNumber}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
