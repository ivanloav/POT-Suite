// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    supportedLngs: ['es', 'en', 'fr'],
    ns: ["translation", "sidebar", "breadcrumb", "common", "lang", "titles", "dashboard", "order"],
    defaultNS: 'translation',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: { order: ['querystring', 'localStorage', 'navigator'], caches: ['localStorage'] },
    interpolation: { escapeValue: false }
  });

export default i18n;