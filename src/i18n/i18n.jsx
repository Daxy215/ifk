import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
    .use(HttpBackend) // loads translation files
    .use(LanguageDetector) // detects browser language
    .use(initReactI18next) // connects with React
    .init({
        fallbackLng: "en",
        load: "languageOnly",
        debug: true,
        interpolation: {
            escapeValue: false, // React escapes by default
        },
        backend: {
            loadPath: "/locales/{{lng}}.json", // path to JSON files
        },
    });

export default i18n;
