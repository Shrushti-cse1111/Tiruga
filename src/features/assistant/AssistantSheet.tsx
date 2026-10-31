import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { apiClient } from '../../api/client';
import { SpeechService } from '../../lib/speech';

export const AssistantSheet: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isOpen = useAppStore((s) => s.isAssistantOpen);
  const setIsOpen = useAppStore((s) => s.setAssistantOpen);
  const activeTripId = useAppStore((s) => s.activeTripId);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string; sources?: string[] }>
  >([
    {
      sender: 'assistant',
      text: i18n.language === 'kn'
        ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪ್ರವಾಸ ಸಹಾಯಕ. ಶೌಚಾಲಯಗಳು, ಕೊನೆಯ ಬಸ್, ಉಡುಪಿನ ನಿಯಮಗಳು ಅಥವಾ ಸ್ಥಳೀಯ ಊಟದ ಬಗ್ಗೆ ಕೇಳಬಹುದು.'
        : i18n.language === 'mr'
        ? 'नमस्कार! मी आपला स्थानिक प्रवास सहाय्यक. शौचालय, शेवटची बस, पोशाख किंवा जेवणाबाबत काहीही विचारा.'
        : 'Namaskara! I am your local deterministic travel assistant. Ask me about toilets, last bus times, dress codes, or where to eat.',
      sources: ['Tiruga Local Knowledge Base']
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open Local Travel Assistant"
        className="fixed bottom-20 right-4 z-40 bg-[#0e5a52] hover:bg-[#14786c] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center dark:bg-[#5cc4b6] dark:text-[#0f1614] min-w-[52px] min-h-[52px]"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setInput('');

    const res = (await apiClient.askAssistant(query, activeTripId || undefined, i18n.language as any)) as {
      answer: string;
      sources: string[];
    };
    setMessages((prev) => [
      ...prev,
      { sender: 'assistant', text: res.answer, sources: res.sources }
    ]);
  };

  const toggleMic = () => {
    if (isListening) {
      if (stopListeningFn) stopListeningFn();
      setIsListening(false);
    } else {
      setIsListening(true);
      const stop = SpeechService.startListening(
        (transcript) => {
          setIsListening(false);
          handleSend(transcript);
        },
        (err) => {
          console.warn('Speech err:', err);
          setIsListening(false);
        },
        i18n.language
      );
      setStopListeningFn(() => stop);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Travel Assistant Dialog"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center"
    >
      <div className="bg-white dark:bg-[#172220] w-full max-w-[420px] h-[85vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#dce5e1] dark:border-[#2b3c38] flex items-center justify-between bg-[#f4f7f3] dark:bg-[#141f1c]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0e5a52] text-white flex items-center justify-center dark:bg-[#5cc4b6] dark:text-[#0f1614]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#15231f] dark:text-[#e8f0ed]">
                {t('assistant.title')}
              </h2>
              <span className="text-xs text-[#5b6c66] dark:text-[#9cb0aa] flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#0e5a52] dark:text-[#5cc4b6]" />
                {t('assistant.subtitle')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Assistant"
            className="p-2 rounded-xl text-[#5b6c66] hover:bg-black/5 dark:hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-[#e9f1ec] dark:bg-[#0f1614] flex gap-2 overflow-x-auto no-scrollbar text-xs">
          {['Where is toilet?', 'When is last bus?', 'Dress code', 'Where to eat?'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-[#172220] text-[#0e5a52] dark:text-[#5cc4b6] border border-[#dce5e1] dark:border-[#2b3c38] whitespace-nowrap active:scale-95 font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#0e5a52] text-white rounded-br-xs dark:bg-[#5cc4b6] dark:text-[#0f1614]'
                    : 'bg-[#f4f7f3] text-[#15231f] border border-[#dce5e1] rounded-bl-xs dark:bg-[#141f1c] dark:text-[#e8f0ed] dark:border-[#2b3c38]'
                }`}
              >
                <p>{m.text}</p>
                {m.sender === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] text-[#5b6c66] dark:text-[#9cb0aa]">
                    <span>{m.sources?.join(', ')}</span>
                    <button
                      type="button"
                      onClick={() => SpeechService.speak(m.text, i18n.language)}
                      aria-label={t('assistant.read_aloud')}
                      className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#0e5a52] dark:text-[#5cc4b6]"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#dce5e1] dark:border-[#2b3c38] bg-white dark:bg-[#172220] flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? 'Stop listening' : 'Start speech recognition'}
            className={`p-3 rounded-2xl transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${
              isListening
                ? 'bg-[#b3261e] text-white animate-pulse'
                : 'bg-[#e9f1ec] text-[#0e5a52] dark:bg-[#141f1c] dark:text-[#5cc4b6]'
            }`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('assistant.ask_placeholder')}
            className="flex-1 bg-[#f4f7f3] dark:bg-[#141f1c] text-[#15231f] dark:text-white px-4 py-3 rounded-2xl border border-[#dce5e1] dark:border-[#2b3c38] text-sm focus:outline-hidden focus:border-[#0e5a52]"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            aria-label="Send message"
            className="p-3 bg-[#0e5a52] text-white rounded-2xl disabled:opacity-40 min-w-[48px] min-h-[48px] flex items-center justify-center dark:bg-[#5cc4b6] dark:text-[#0f1614]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
