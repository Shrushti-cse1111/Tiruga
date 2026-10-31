import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  WifiOff,
  HelpCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import { Button } from './CommonComponents';

export interface AskAboutPlaceSheetProps {
  placeName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface QAPair {
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Validated stub for asking questions about a place.
 * TODO: replace with server call (POST /api/ask-place via Gemini search grounding)
 */
export async function queryPlaceGuide(
  destination: string,
  question: string
): Promise<{ answer: string; confidence: 'high' | 'medium' | 'low' }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = question.toLowerCase().trim();
      let answer = `${destination} is an Archaeological Survey of India (ASI) protected heritage monument in Karnataka. Open access is available during standard daylight hours.`;
      let confidence: 'high' | 'medium' | 'low' = 'high';

      if (q.includes('wear') || q.includes('dress') || q.includes('cloth')) {
        answer = `Modest clothing covering shoulders and knees is recommended out of respect for active temple shrines at ${destination}. Slip-on footwear is best as shoes must be left outside sacred precincts.`;
        confidence = 'high';
      } else if (q.includes('time') || q.includes('when') || q.includes('visit') || q.includes('morning')) {
        answer = `Early mornings between 06:30 AM and 09:30 AM or late afternoons after 04:00 PM offer the best conditions to explore ${destination}, avoiding the peak boulder radiation.`;
        confidence = 'high';
      } else if (q.includes('etiquette') || q.includes('culture') || q.includes('rule')) {
        answer = `Please walk clockwise around shrines (Pradakshina). Photography of consecrated sanctum deities is restricted. Support local certified guides wearing government photo IDs.`;
        confidence = 'high';
      } else if (q.includes('food') || q.includes('eat') || q.includes('cafe')) {
        answer = `Light snacks and fresh tender coconuts are sold by local vendors near the approach pathways. Packaged meals should be enjoyed outside the monument precinct to preserve heritage sanctity.`;
        confidence = 'medium';
      } else {
        // Unsure case
        answer = `I do not have specific verified archival data regarding "${question}" for ${destination}. Please consult the local ASI tourism kiosk or certified temple trustees.`;
        confidence = 'low';
      }

      // Ensure answer is under 120 words
      const words = answer.split(' ');
      if (words.length > 120) {
        answer = words.slice(0, 120).join(' ') + '...';
      }

      resolve({ answer, confidence });
    }, 450);
  });
}

export const AskAboutPlaceSheet: React.FC<AskAboutPlaceSheetProps> = ({
  placeName,
  isOpen,
  onClose
}) => {
  const isOnline = useOnlineStatus();
  const [questionInput, setQuestionInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<QAPair[]>([]);

  if (!isOpen) return null;

  const handleSend = async (qToSend?: string) => {
    const query = (qToSend || questionInput).trim();
    if (!query) return;

    if (!isOnline) {
      setErrorMessage('AI features need an internet connection.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await queryPlaceGuide(placeName, query);
      setHistory((prev) => [
        {
          question: query,
          answer: res.answer,
          confidence: res.confidence
        },
        ...prev.slice(0, 2) // keep last 3 Q&A pairs for session
      ]);
      setQuestionInput('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve response. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return (
          <span className="text-[10px] font-bold bg-mint text-deep-teal px-2 py-0.5 rounded-full border border-primary-teal/20">
            High Confidence
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
            Medium Confidence
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-bold bg-rose-100 text-terracotta px-2 py-0.5 rounded-full border border-rose-200">
            Low Confidence
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in p-0 sm:p-4">
      <div className="bg-white w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] max-h-[85vh] p-5 space-y-4 shadow-2xl border border-[#E2DFD3] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-mint text-deep-teal flex items-center justify-center">
              <Sparkles size={16} className="text-gold" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-main truncate max-w-[260px]">
                Ask about {placeName}
              </h3>
              <p className="text-[10px] text-muted-text">Verified Karnataka heritage guide</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-text-main hover:bg-[#E2DFD3] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pr-1">
          {/* Suggested Question Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-main block">Suggested Questions</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Best time to visit?',
                'What should I wear?',
                'Any cultural etiquette?'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={!isOnline || isLoading}
                  className="text-xs bg-cream hover:bg-mint text-text-main font-semibold px-3 py-1.5 rounded-full border border-[#E2DFD3] transition-colors cursor-pointer disabled:opacity-50 text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Offline notice */}
          {!isOnline && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-xs text-amber-900">
              <WifiOff size={15} className="text-amber-700 shrink-0" />
              <span>AI features need an internet connection.</span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 bg-cream rounded-2xl flex items-center justify-center space-x-2 text-xs text-muted-text animate-pulse">
              <div className="w-4 h-4 border-2 border-primary-teal border-t-transparent rounded-full animate-spin" />
              <span>Thinking & consulting Karnataka heritage archives...</span>
            </div>
          )}

          {/* Error Banner with Retry */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 p-3 rounded-2xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center space-x-1.5">
                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSend()}
                className="text-xs font-bold text-rose-700 underline flex items-center cursor-pointer ml-2"
              >
                <RotateCcw size={12} className="mr-1" />
                Retry
              </button>
            </div>
          )}

          {/* Q&A History Cards (last 3 for session) */}
          {history.length > 0 && (
            <div className="space-y-3">
              {history.map((qa, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-[#E2DFD3] shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-deep-teal">Q: {qa.question}</span>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      <span className="text-[10px] bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full font-bold">
                        AI-generated
                      </span>
                      {getConfidenceBadge(qa.confidence)}
                    </div>
                  </div>

                  <p className="text-xs text-text-main leading-relaxed bg-cream/70 p-3 rounded-xl">
                    {qa.answer}
                  </p>

                  <div className="text-[10px] text-muted-text space-y-0.5">
                    {qa.confidence === 'low' && (
                      <p className="text-terracotta font-semibold">
                        I'm not certain about this.
                      </p>
                    )}
                    <p className="italic">
                      Tiruga may be unsure. Verify dates, prices and timings locally.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area (max 200 chars with counter) */}
        <div className="pt-2 border-t border-[#F0ECE1] shrink-0 space-y-1.5">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={200}
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask anything about timings, dress code..."
              disabled={!isOnline || isLoading}
              className="flex-1 bg-cream border border-[#E2DFD3] rounded-2xl px-3.5 py-2.5 text-xs text-text-main placeholder:text-muted-text focus:outline-primary-teal disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!isOnline || isLoading || !questionInput.trim()}
              aria-label="Send question"
              className="w-11 h-11 rounded-2xl bg-deep-teal hover:bg-primary-teal text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-[10px] text-muted-text text-right font-mono">
            {questionInput.length}/200
          </div>
        </div>
      </div>
    </div>
  );
};
