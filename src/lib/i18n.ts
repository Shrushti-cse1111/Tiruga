import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import kn from '../locales/kn.json';
import mr from '../locales/mr.json';

const savedLang = localStorage.getItem('tiruga_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    kn: { translation: kn },
    mr: { translation: mr }
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

// Update lang attribute on html tag
document.documentElement.lang = savedLang;

export const changeLanguage = (lang: 'en' | 'kn' | 'mr') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('tiruga_lang', lang);
  document.documentElement.lang = lang;
  if (lang === 'kn') {
    document.body.classList.add('kn');
    document.body.classList.remove('mr');
  } else if (lang === 'mr') {
    document.body.classList.add('mr');
    document.body.classList.remove('kn');
  } else {
    document.body.classList.remove('kn', 'mr');
  }
};

export function getI18nText(
  text?: { en?: string; kn?: string; mr?: string } | null,
  lang: string = 'en'
): string {
  if (!text) return '';
  const l = lang === 'kn' || lang === 'mr' || lang === 'en' ? (lang as 'en' | 'kn' | 'mr') : 'en';
  return text[l] || text.en || '';
}

if (savedLang === 'kn') document.body.classList.add('kn');
if (savedLang === 'mr') document.body.classList.add('mr');

export default i18n;
