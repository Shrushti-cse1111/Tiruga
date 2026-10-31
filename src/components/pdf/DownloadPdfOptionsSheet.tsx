import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  FileDown,
  Check,
  Lock,
  DollarSign,
  Bus,
  CloudRain,
  Music,
  Languages,
  BookOpen,
  ShieldAlert,
  User
} from 'lucide-react';
import { Trip } from '../../data/types';
import { useLanguage } from '../../lib/languageContext';
import { getPdfString } from '../../i18n';

export interface DownloadPdfOptions {
  includeItinerary: boolean; // always true
  includeCosts: boolean;
  includeTravel: boolean;
  includePlanB: boolean;
  includePlaylist: boolean;
  includePhrases: boolean;
  includeCulture: boolean;
  includeEmergency: boolean;
  includeName: boolean;
  paperSize: 'A4' | 'Letter';
}

export interface DownloadPdfOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

/**
 * Checks if a Plan B modification was recorded or applied to this trip.
 */
export function hasTripPlanB(trip: Trip): boolean {
  if (!trip) return false;
  try {
    const local = localStorage.getItem(`tiruga_planb_${trip.id}`);
    if (local) return true;
  } catch {}
  if ((trip as any).appliedPlanB || (trip as any).planBHistory) return true;
  return trip.days?.some(
    (d) =>
      d.summary?.toLowerCase().includes('plan b') ||
      d.summary?.toLowerCase().includes('monsoon contingency') ||
      d.summary?.toLowerCase().includes('heat wave')
  );
}

/**
 * Checks if a Swara playlist exists for this trip (curated default exists for Hampi/Karnataka).
 */
export function hasTripPlaylist(trip: Trip): boolean {
  if (!trip) return false;
  try {
    const local = localStorage.getItem(`tiruga_playlist_${trip.id}`);
    if (local) return true;
  } catch {}
  if ((trip as any).playlist) return true;
  const dest = (trip.destination || '').toLowerCase();
  const destId = (trip.destinationId || '').toLowerCase();
  return dest.includes('hampi') || destId.includes('hampi') || trip.id === 'trip_hampi_3d';
}

export const DownloadPdfOptionsSheet: React.FC<DownloadPdfOptionsSheetProps> = ({
  isOpen,
  onClose,
  trip
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const lang = language === 'kn' ? 'kn' : 'en';

  const planBAvailable = hasTripPlanB(trip);
  const playlistAvailable = hasTripPlaylist(trip);

  // Section selections (all ON by default)
  const [includeCosts, setIncludeCosts] = useState<boolean>(true);
  const [includeTravel, setIncludeTravel] = useState<boolean>(true);
  const [includePlanB, setIncludePlanB] = useState<boolean>(planBAvailable);
  const [includePlaylist, setIncludePlaylist] = useState<boolean>(playlistAvailable);
  const [includePhrases, setIncludePhrases] = useState<boolean>(true);
  const [includeCulture, setIncludeCulture] = useState<boolean>(true);
  const [includeEmergency, setIncludeEmergency] = useState<boolean>(true);

  // Privacy option: off by default
  const [includeName, setIncludeName] = useState<boolean>(false);

  // Paper size choice: A4 default
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter'>('A4');

  // Focus trap refs
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (planBAvailable) setIncludePlanB(true);
    if (playlistAvailable) setIncludePlaylist(true);
  }, [planBAvailable, playlistAvailable]);

  // Focus Trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside the sheet
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const timer = setTimeout(() => {
      if (sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && sheetRef.current) {
        const focusables = Array.from(
          sheetRef.current.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreatePdf = () => {
    const options: DownloadPdfOptions = {
      includeItinerary: true,
      includeCosts,
      includeTravel,
      includePlanB: planBAvailable && includePlanB,
      includePlaylist: playlistAvailable && includePlaylist,
      includePhrases,
      includeCulture,
      includeEmergency,
      includeName,
      paperSize
    };

    const searchParams = new URLSearchParams({
      paper: paperSize,
      costs: includeCosts ? '1' : '0',
      travel: includeTravel ? '1' : '0',
      planb: planBAvailable && includePlanB ? '1' : '0',
      playlist: playlistAvailable && includePlaylist ? '1' : '0',
      phrases: includePhrases ? '1' : '0',
      culture: includeCulture ? '1' : '0',
      emergency: includeEmergency ? '1' : '0',
      name: includeName ? '1' : '0'
    });

    onClose();
    navigate(`/trip/${trip.id}/print?${searchParams.toString()}`, {
      state: { options, trip }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-options-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4 select-none"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2DFD3] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E2DFD3] flex items-center justify-between bg-cream/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-mint text-deep-teal flex items-center justify-center shrink-0">
              <FileDown size={18} />
            </div>
            <div>
              <h3 id="pdf-options-title" className="font-bold text-base text-text-main font-heading">
                {getPdfString('options_sheet_title', lang)}
              </h3>
              <p className="text-[11px] text-muted-text">
                {trip.title} · {trip.totalDays} {getPdfString('duration_label', lang)}
              </p>
            </div>
          </div>
          {/* 44px minimum touch target for Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-text block mb-2">
              Sections to Include
            </span>
            <div className="space-y-2">
              {/* 1. Itinerary (Always included & locked - 44px min-height) */}
              <div className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-cream/70 border border-[#E2DFD3]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mint text-deep-teal flex items-center justify-center shrink-0">
                    <Check size={14} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-main block">
                      {getPdfString('itinerary_section', lang)}
                    </span>
                    <span className="text-[10px] text-muted-text">
                      {getPdfString('always_included', lang)}
                    </span>
                  </div>
                </div>
                <Lock size={15} className="text-muted-text mr-1" />
              </div>

              {/* 2. Costs summary (44px min-height) */}
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mint/50 text-deep-teal flex items-center justify-center shrink-0">
                    <DollarSign size={14} />
                  </div>
                  <span className="text-xs font-semibold text-text-main">
                    {getPdfString('costs_summary', lang)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeCosts}
                  onChange={(e) => setIncludeCosts(e.target.checked)}
                  className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
                />
              </label>

              {/* 3. Travel options (44px min-height) */}
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mint/50 text-deep-teal flex items-center justify-center shrink-0">
                    <Bus size={14} />
                  </div>
                  <span className="text-xs font-semibold text-text-main">
                    {getPdfString('travel_options', lang)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeTravel}
                  onChange={(e) => setIncludeTravel(e.target.checked)}
                  className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
                />
              </label>

              {/* 4. Plan B changes (only if Plan B was applied - 44px min-height) */}
              {planBAvailable && (
                <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-terracotta/30 bg-terracotta/5 hover:bg-terracotta/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-terracotta/20 text-terracotta flex items-center justify-center shrink-0">
                      <CloudRain size={14} />
                    </div>
                    <span className="text-xs font-semibold text-text-main">
                      {getPdfString('plan_b_changes', lang)}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePlanB}
                    onChange={(e) => setIncludePlanB(e.target.checked)}
                    className="w-5 h-5 rounded text-terracotta accent-terracotta cursor-pointer"
                  />
                </label>
              )}

              {/* 5. Swara playlist (only if playlist exists - 44px min-height) */}
              {playlistAvailable && (
                <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-mint/50 text-deep-teal flex items-center justify-center shrink-0">
                      <Music size={14} />
                    </div>
                    <span className="text-xs font-semibold text-text-main">
                      {getPdfString('swara_playlist', lang)}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includePlaylist}
                    onChange={(e) => setIncludePlaylist(e.target.checked)}
                    className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
                  />
                </label>
              )}

              {/* 6. Kannada phrases (44px min-height) */}
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mint/50 text-deep-teal flex items-center justify-center shrink-0">
                    <Languages size={14} />
                  </div>
                  <span className="text-xs font-semibold text-text-main">
                    {getPdfString('kannada_phrases', lang)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includePhrases}
                  onChange={(e) => setIncludePhrases(e.target.checked)}
                  className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
                />
              </label>

              {/* 7. Culture notes (44px min-height) */}
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-mint/50 text-deep-teal flex items-center justify-center shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-xs font-semibold text-text-main">
                    {getPdfString('culture_notes', lang)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeCulture}
                  onChange={(e) => setIncludeCulture(e.target.checked)}
                  className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
                />
              </label>

              {/* 8. Emergency and safety info (44px min-height) */}
              <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl border border-[#E2DFD3] hover:bg-cream/40 transition-colors cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <ShieldAlert size={14} />
                  </div>
                  <span className="text-xs font-semibold text-text-main">
                    {getPdfString('emergency_safety', lang)}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={includeEmergency}
                  onChange={(e) => setIncludeEmergency(e.target.checked)}
                  className="w-5 h-5 rounded text-rose-600 accent-rose-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Privacy & Customization */}
          <div className="pt-2 border-t border-[#E2DFD3] space-y-3">
            {/* Paper Size with 44px min-height touch targets */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-main">
                {getPdfString('paper_size', lang)}
              </span>
              <div className="flex bg-[#EFECE2] p-1 rounded-full gap-1">
                <button
                  type="button"
                  onClick={() => setPaperSize('A4')}
                  className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    paperSize === 'A4'
                      ? 'bg-deep-teal text-white shadow-xs'
                      : 'text-muted-text hover:text-text-main'
                  }`}
                >
                  {getPdfString('paper_a4', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setPaperSize('Letter')}
                  className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    paperSize === 'Letter'
                      ? 'bg-deep-teal text-white shadow-xs'
                      : 'text-muted-text hover:text-text-main'
                  }`}
                >
                  {getPdfString('paper_letter', lang)}
                </button>
              </div>
            </div>

            {/* Privacy: Include my name (Off by default - 44px min-height) */}
            <label className="min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-cream/40 border border-[#E2DFD3] cursor-pointer">
              <div className="flex items-center space-x-2">
                <User size={15} className="text-muted-text" />
                <span className="text-xs font-medium text-text-main">
                  {getPdfString('include_name', lang)}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeName}
                onChange={(e) => setIncludeName(e.target.checked)}
                className="w-5 h-5 rounded text-deep-teal accent-deep-teal cursor-pointer"
              />
            </label>
          </div>

          {/* Phone hint note */}
          <p className="text-[11px] text-muted-text text-center px-2 leading-relaxed">
            {getPdfString('phone_hint', lang)}
          </p>
        </div>

        {/* Footer actions with 44px min-height targets */}
        <div className="p-4 border-t border-[#E2DFD3] bg-white flex space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full border border-[#E2DFD3] text-xs font-bold text-text-main hover:bg-cream transition-colors cursor-pointer flex items-center justify-center"
          >
            {getPdfString('back', lang)}
          </button>
          <button
            type="button"
            onClick={handleCreatePdf}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-full bg-deep-teal text-white text-xs font-bold shadow-md hover:bg-[#146B5B] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <FileDown size={16} />
            <span>{getPdfString('create_pdf', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
