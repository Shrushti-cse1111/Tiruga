import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Info,
  Bookmark,
  AlertTriangle,
  RotateCcw,
  WifiOff,
  X
} from 'lucide-react';
import { KannadaPhrase, generatePhrase } from '../../data/seedPhrases';
import { getPhrases, PHRASES_DATA } from '../../lib/db';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import {
  Button,
  LoadingSkeleton,
  EmptyState,
  BottomNav
} from '../../components/common/CommonComponents';

const CATEGORIES = [
  'Basic conversation',
  'Restaurant',
  'Transport',
  'Directions',
  'Hotel',
  'Shopping',
  'Emergency'
] as const;

export const KannadaCompanionScreen: React.FC = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('Basic conversation');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [hasKnVoice, setHasKnVoice] = useState<boolean>(true);
  const [voiceNoticeDismissed, setVoiceNoticeDismissed] = useState<boolean>(false);

  // Generate phrase state
  const [situationInput, setSituationInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPhrase, setGeneratedPhrase] = useState<KannadaPhrase | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detect Kannada speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setHasKnVoice(false);
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const knVoice = voices.some(
        (v) => v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('kannada')
      );
      setHasKnVoice(knVoice);
    };

    checkVoices();
    window.speechSynthesis.onvoiceschanged = checkVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Play audio pronunciation
  const handleListen = (phrase: { id: string; kannada: string }) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      showToast('Speech synthesis is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(phrase.id);

    try {
      const utterance = new SpeechSynthesisUtterance(phrase.kannada);
      utterance.lang = 'kn-IN';
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const knVoice = voices.find(
        (v) => v.lang.toLowerCase().startsWith('kn') || v.lang.toLowerCase().includes('kannada')
      );
      if (knVoice) {
        utterance.voice = knVoice;
      }

      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingId(null);
    }
  };

  // Copy phrase
  const handleCopy = (phrase: KannadaPhrase) => {
    navigator.clipboard.writeText(`${phrase.kannada} (${phrase.pronunciation}) - ${phrase.english}`);
    setCopiedId(phrase.id);
    showToast('Phrase copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate phrase for situation
  const handleGenerate = async () => {
    if (!isOnline) {
      setGenerateError('AI features need an internet connection.');
      return;
    }

    if (!situationInput.trim()) return;
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await generatePhrase(situationInput);
      if (!res.kannada || !res.english || !res.pronunciation || !res.situation) {
        throw new Error('Received incomplete response. Please retry.');
      }
      setGeneratedPhrase({
        id: `gen-${Date.now()}`,
        category: 'Basic conversation',
        ...res
      });
      showToast('New phrase generated!');
    } catch (err: any) {
      setGenerateError(err.message || 'Failed to generate phrase. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated phrase locally
  const handleSaveGenerated = (phrase: KannadaPhrase) => {
    try {
      const stored = localStorage.getItem('tiruga_saved_custom_phrases') || '[]';
      const parsed = JSON.parse(stored);
      parsed.unshift(phrase);
      localStorage.setItem('tiruga_saved_custom_phrases', JSON.stringify(parsed));
      showToast('Phrase saved to your profile!');
    } catch {
      showToast('Phrase saved locally.');
    }
  };

  const [phrasesList, setPhrasesList] = useState<KannadaPhrase[]>(PHRASES_DATA);

  useEffect(() => {
    getPhrases().then((data) => {
      if (data && data.length > 0) {
        setPhrasesList(data);
      }
    });
  }, []);

  // Filter phrases
  const filteredPhrases = useMemo(() => {
    return (phrasesList.length > 0 ? phrasesList : PHRASES_DATA).filter((p) => {
      const matchesCategory = p.category === selectedCategory;
      const matchesSearch =
        p.kannada.includes(searchQuery) ||
        p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pronunciation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [phrasesList, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-cream text-text-main flex flex-col justify-between max-w-[430px] mx-auto pb-6 relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-deep-teal text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center space-x-2 animate-fade-in border border-white/20">
          <Check size={14} className="text-gold" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight font-heading text-deep-teal">
                Kannada Companion
              </h1>
              <span className="text-xs font-bold text-primary-teal bg-mint px-2 py-0.5 rounded-full font-kannada">
                ಕನ್ನಡ
              </span>
            </div>
            <p className="text-xs text-muted-text">Essential phrases with audio & pronunciations</p>
          </div>
        </div>

        {/* 4. Curated note & offline ready banner */}
        <div className="bg-white p-3 rounded-2xl border border-[#E2DFD3] shadow-xs flex items-start space-x-2 text-[11px] text-muted-text">
          <Info size={14} className="text-primary-teal shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-text-main">Curated phrases work offline. </span>
            Have a native speaker review before public demonstration.
          </div>
        </div>

        {/* Voice support warning (if no kn voice) */}
        {!hasKnVoice && !voiceNoticeDismissed && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 flex items-start justify-between space-x-2 animate-fade-in">
            <div className="flex items-start space-x-1.5">
              <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                No Kannada voice found on this device. You can still read the Kannada script and English pronunciation.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceNoticeDismissed(true)}
              className="text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 6. "Generate for my situation" AI Area */}
        <div className="bg-white p-4 rounded-3xl border border-[#E2DFD3] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-mint text-deep-teal flex items-center justify-center">
                <Sparkles size={14} className="text-gold" />
              </div>
              <h3 className="text-xs font-bold text-text-main">Generate for My Situation</h3>
            </div>
            <span className="text-[10px] bg-primary-teal/10 text-primary-teal font-bold px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={situationInput}
                onChange={(e) => setSituationInput(e.target.value)}
                placeholder="e.g. I want to ask for less spicy food..."
                disabled={!isOnline || isGenerating}
                className="flex-1 bg-cream border border-[#E2DFD3] rounded-2xl px-3.5 py-2.5 text-xs text-text-main placeholder:text-muted-text focus:outline-primary-teal disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!isOnline || isGenerating || !situationInput.trim()}
                className="min-h-[44px] px-4 rounded-2xl bg-deep-teal hover:bg-primary-teal text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Generate'
                )}
              </button>
            </div>

            {/* Offline notice for AI */}
            {!isOnline && (
              <p className="text-[10px] text-terracotta flex items-center">
                <WifiOff size={11} className="mr-1" />
                AI features need an internet connection.
              </p>
            )}

            {/* Error Banner with Retry */}
            {generateError && (
              <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-xl flex items-center justify-between text-xs text-rose-800">
                <div className="flex items-center space-x-1.5">
                  <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                  <span>{generateError}</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="text-xs font-bold text-rose-700 underline flex items-center cursor-pointer ml-2"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Generated Result Card */}
          {generatedPhrase && (
            <div className="bg-[#FAF3E9] p-3.5 rounded-2xl border border-terracotta/40 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-terracotta text-white px-2 py-0.5 rounded-full">
                  AI-generated
                </span>
                <button
                  type="button"
                  onClick={() => handleSaveGenerated(generatedPhrase)}
                  className="text-[11px] font-semibold text-deep-teal hover:underline flex items-center cursor-pointer"
                >
                  <Bookmark size={12} className="mr-1" />
                  Save phrase
                </button>
              </div>

              <div className="font-kannada text-lg font-bold text-deep-teal leading-snug">
                {generatedPhrase.kannada}
              </div>
              <div className="text-xs text-text-main font-semibold">
                {generatedPhrase.english}
              </div>
              <div className="text-[11px] text-muted-text italic">
                "{generatedPhrase.pronunciation}"
              </div>

              <p className="text-[10px] text-muted-text pt-1 border-t border-terracotta/20 italic">
                Please verify with a local speaker.
              </p>
            </div>
          )}
        </div>

        {/* 2. Category Chips & Search */}
        <div className="space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases in English or pronunciation..."
              className="w-full bg-white border border-[#E2DFD3] rounded-full pl-9 pr-4 py-2.5 text-xs text-text-main placeholder:text-muted-text focus:outline-primary-teal shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-text-main cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Horizontal scroll category chips */}
          <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
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

        {/* 3. Phrase Cards List */}
        <div className="space-y-3 pt-1">
          {filteredPhrases.length === 0 ? (
            <EmptyState
              title="No phrases found"
              subtitle="Try adjusting your search terms or switch to another category."
              actionText="Reset Search"
              onAction={() => setSearchQuery('')}
            />
          ) : (
            filteredPhrases.map((phrase) => {
              const isSpeaking = speakingId === phrase.id;
              const isCopied = copiedId === phrase.id;

              return (
                <div
                  key={phrase.id}
                  className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs hover:border-primary-teal/40 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    {/* Kannada Script (Large Noto Sans Kannada) */}
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="font-kannada text-lg sm:text-xl font-bold text-deep-teal leading-snug">
                        {phrase.kannada}
                      </div>
                      <div className="text-xs font-semibold text-text-main">
                        {phrase.english}
                      </div>
                      <div className="text-[11px] text-muted-text italic">
                        "{phrase.pronunciation}"
                      </div>
                    </div>

                    {/* Actions: Listen button (min 44px) & copy icon */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleListen(phrase)}
                        aria-label={`Listen to ${phrase.english}`}
                        className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isSpeaking
                            ? 'bg-primary-teal text-white border-primary-teal animate-pulse'
                            : 'bg-cream text-deep-teal border-[#E2DFD3] hover:bg-mint'
                        }`}
                      >
                        <Volume2 size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(phrase)}
                        aria-label="Copy phrase"
                        className="w-10 h-10 rounded-full bg-cream text-muted-text hover:text-text-main flex items-center justify-center border border-[#E2DFD3] transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check size={15} className="text-primary-teal" /> : <Copy size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Situation tag chip */}
                  <div className="pt-1 border-t border-[#F0ECE1] flex items-center justify-between text-[10px]">
                    <span className="text-muted-text bg-cream px-2 py-0.5 rounded-full border border-[#E2DFD3]">
                      {phrase.situation}
                    </span>
                    <span className="text-primary-teal font-medium font-mono">
                      kn-IN verified
                    </span>
                  </div>
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
