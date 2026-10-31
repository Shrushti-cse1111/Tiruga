export type ApiMode = 'server' | 'local' | 'firebase';

export const config = {
  appName: 'Tiruga (ತಿರುಗ)',
  apiMode: (import.meta.env.VITE_API_MODE as ApiMode) || 'firebase',
  apiBaseUrl: '/api/v1',
  version: '1.0.0',
  defaultLanguage: 'en' as 'en' | 'kn' | 'mr',
  defaultCity: 'Bengaluru',
  defaultBudget: 6000,
  defaultDays: 3,
  supportNumbers: {
    police: '112',
    ambulance: '108',
    womenHelpline: '181',
    touristHelpline: '1800-425-2425'
  }
};
