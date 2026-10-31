import { create } from 'zustand';

export interface OnboardingState {
  interests: string[];
  days: number;
  budget: number;
  style: string;
  start_city: string;
  start_date: string;
  is_woman: boolean;
  karnataka_domicile: boolean;
}

interface AppStore {
  // Theme & accessibility
  isDark: boolean;
  largeText: boolean;
  seniorMode: boolean;
  toggleTheme: () => void;
  toggleLargeText: () => void;
  toggleSeniorMode: () => void;

  // Onboarding draft state
  onboarding: OnboardingState;
  setOnboarding: (updates: Partial<OnboardingState>) => void;
  resetOnboarding: () => void;

  // Active trip & UI state
  activeTripId: string | null;
  setActiveTripId: (id: string | null) => void;
  isAssistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  isAgentRunsOpen: boolean;
  setAgentRunsOpen: (open: boolean) => void;

  // Toasts
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const defaultOnboarding: OnboardingState = {
  interests: ['heritage', 'food'],
  days: 3,
  budget: 6000,
  style: 'women_group',
  start_city: 'Bengaluru',
  start_date: '2026-10-31', // upcoming weekend
  is_woman: true,
  karnataka_domicile: true
};

export const useAppStore = create<AppStore>((set, get) => {
  const savedDark = localStorage.getItem('tiruga_dark') === 'true';
  const savedLarge = localStorage.getItem('tiruga_large') === 'true';
  const savedSenior = localStorage.getItem('tiruga_senior') === 'true';

  if (savedDark) document.documentElement.classList.add('dark');
  if (savedLarge) document.documentElement.classList.add('large-text');

  return {
    isDark: savedDark,
    largeText: savedLarge,
    seniorMode: savedSenior,

    toggleTheme: () => {
      const next = !get().isDark;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('tiruga_dark', String(next));
      set({ isDark: next });
    },

    toggleLargeText: () => {
      const next = !get().largeText;
      if (next) {
        document.documentElement.classList.add('large-text');
      } else {
        document.documentElement.classList.remove('large-text');
      }
      localStorage.setItem('tiruga_large', String(next));
      set({ largeText: next });
    },

    toggleSeniorMode: () => {
      const next = !get().seniorMode;
      localStorage.setItem('tiruga_senior', String(next));
      set({ seniorMode: next });
    },

    onboarding: defaultOnboarding,
    setOnboarding: (updates) => {
      set({ onboarding: { ...get().onboarding, ...updates } });
    },
    resetOnboarding: () => set({ onboarding: defaultOnboarding }),

    activeTripId: null,
    setActiveTripId: (id) => set({ activeTripId: id }),
    isAssistantOpen: false,
    setAssistantOpen: (open) => set({ isAssistantOpen: open }),
    isAgentRunsOpen: false,
    setAgentRunsOpen: (open) => set({ isAgentRunsOpen: open }),

    toastMessage: null,
    showToast: (msg: string) => {
      set({ toastMessage: msg });
      setTimeout(() => {
        if (get().toastMessage === msg) {
          set({ toastMessage: null });
        }
      }, 3000);
    },
    clearToast: () => set({ toastMessage: null })
  };
});
