import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'kn';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.plan': 'Plan',
    'nav.saved': 'Saved',
    'nav.profile': 'Profile',
    'nav.kannada': 'Kannada Companion',
    'common.get_started': 'Get Started',
    'common.login': 'Login',
    'common.guest': 'Continue as Guest',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.skip': 'Skip',
    'common.finish': 'Finish',
    'common.save': 'Save',
    'common.saved': 'Saved',
    'common.delete': 'Delete',
    'common.cancel': 'Cancel',
    'common.apply': 'Apply',
    'common.free': 'Free',
    'common.estimated': 'Estimated',
    'common.demo_data': 'Demo data',
    'common.offline_active': 'Offline mode is active',
    'common.offline_notice': "You're offline. Showing your downloaded trip.",
    'common.ai_offline_disabled': 'AI features need an internet connection.',
    'common.check_locally': 'Verify locally',
    'plan.title': 'Trip Plan',
    'plan.view_full': 'View Full Itinerary',
    'plan.modify_ai': 'Modify with AI',
    'plan.download_offline': 'Download for Offline',
    'plan.ask_place': 'Ask about this place',
    'travel.title': 'Travel Options',
    'travel.buses': 'Buses',
    'travel.trains': 'Trains',
    'travel.cabs': 'Cabs',
    'travel.shakti': 'Karnataka Shakti Scheme',
    'nearby.title': 'Nearby Attractions',
    'nearby.search_placeholder': 'Search temples, cafes, viewpoints...',
    'offline.title': 'Offline & Language',
    'offline.go_offline': 'Go Offline',
    'offline.download_trip': 'Download Trip',
    'saved.title': 'Saved Items',
    'saved.trips': 'Trips',
    'saved.places': 'Places',
    'profile.title': 'My Profile',
    'profile.preferences': 'Travel Preferences',
    'profile.emergency': 'Emergency Access',
    'profile.language': 'Language / ಭಾಷೆ',
    'profile.logout': 'Sign Out',
    'kannada.title': 'Kannada Companion',
    'kannada.listen': 'Listen',
    'kannada.generate_situation': 'Generate for my situation'
  },
  kn: {
    'nav.home': 'ಮುಖಪುಟ',
    'nav.plan': 'ಯೋಜನೆ',
    'nav.saved': 'ಉಳಿಸಿದವು',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'nav.kannada': 'ಕನ್ನಡ ಸಹಾಯಕ',
    'common.get_started': 'ಪ್ರಾರಂಭಿಸಿ',
    'common.login': 'ಲಾಗಿನ್',
    'common.guest': 'ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ',
    'common.next': 'ಮುಂದೆ',
    'common.back': 'ಹಿಂದೆ',
    'common.skip': 'ಬಿಟ್ಟುಬಿಡಿ',
    'common.finish': 'ಮುಕ್ತಾಯ',
    'common.save': 'ಉಳಿಸಿ',
    'common.saved': 'ಉಳಿಸಲಾಗಿದೆ',
    'common.delete': 'ಅಳಿಸಿ',
    'common.cancel': 'ರದ್ದುಮಾಡಿ',
    'common.apply': 'ಅನ್ವಯಿಸಿ',
    'common.free': 'ಉಚಿತ',
    'common.estimated': 'ಅಂದಾಜು',
    'common.demo_data': 'ಡೆಮೊ ಮಾಹಿತಿ',
    'common.offline_active': 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
    'common.offline_notice': 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ವಿವರಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    'common.ai_offline_disabled': 'AI ಸೌಲಭ್ಯಗಳಿಗೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಗತ್ಯವಿದೆ.',
    'common.check_locally': 'ಸ್ಥಳೀಯವಾಗಿ ಪರಿಶೀಲಿಸಿ',
    'plan.title': 'ಪ್ರವಾಸದ ಯೋಜನೆ',
    'plan.view_full': 'ಸಂಪೂರ್ಣ ಯೋಜನೆ ವೀಕ್ಷಿಸಿ',
    'plan.modify_ai': 'AI ನೊಂದಿಗೆ ಬದಲಾಯಿಸಿ',
    'plan.download_offline': 'ಆಫ್‌ಲೈನ್‌ಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'plan.ask_place': 'ಈ ಸ್ಥಳದ ಬಗ್ಗೆ ಕೇಳಿ',
    'travel.title': 'ಪ್ರಯಾಣದ ಆಯ್ಕೆಗಳು',
    'travel.buses': 'ಬಸ್‌ಗಳು',
    'travel.trains': 'ರೈಲುಗಳು',
    'travel.cabs': 'ಟ್ಯಾಕ್ಸಿಗಳು',
    'travel.shakti': 'ಕರ್ನಾಟಕ ಶಕ್ತಿ ಯೋಜನೆ',
    'nearby.title': 'ಹತ್ತಿರದ ಆಕರ್ಷಣೆಗಳು',
    'nearby.search_placeholder': 'ದೇವಾಲಯಗಳು, ಹೋಟೆಲ್‌ಗಳನ್ನು ಹುಡುಕಿ...',
    'offline.title': 'ಆಫ್‌ಲೈನ್ ಮತ್ತು ಭಾಷೆ',
    'offline.go_offline': 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಬಳಸಿ',
    'offline.download_trip': 'ಪ್ರವಾಸ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    'saved.title': 'ಉಳಿಸಿದ ಅಂಶಗಳು',
    'saved.trips': 'ಪ್ರವಾಸಗಳು',
    'saved.places': 'ಸ್ಥಳಗಳು',
    'profile.title': 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    'profile.preferences': 'ಪ್ರಯಾಣದ ಆದ್ಯತೆಗಳು',
    'profile.emergency': 'ತುರ್ತು ಸಂಪರ್ಕಗಳು',
    'profile.language': 'ಭಾಷೆ / Language',
    'profile.logout': 'ಸೈನ್ ಔಟ್',
    'kannada.title': 'ಕನ್ನಡ ಸಹಾಯಕ',
    'kannada.listen': 'ಕೇಳಿ',
    'kannada.generate_situation': 'ನನ್ನ ಪರಿಸ್ಥಿತಿಗೆ ವಾಕ್ಯ ರಚಿಸಿ'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tiruga_lang');
    return saved === 'kn' ? 'kn' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tiruga_lang', lang);
    document.documentElement.lang = lang;
    if (lang === 'kn') {
      document.body.classList.add('kn');
    } else {
      document.body.classList.remove('kn');
    }

    // TODO: replace with server call / Firestore users/{uid}.language update
    try {
      const user = localStorage.getItem('tiruga_user');
      if (user) {
        const parsed = JSON.parse(user);
        parsed.language = lang;
        localStorage.setItem('tiruga_user', JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'kn') {
      document.body.classList.add('kn');
    } else {
      document.body.classList.remove('kn');
    }
  }, [language]);

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
