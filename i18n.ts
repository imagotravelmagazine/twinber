
import { Question } from './types';
import { enQuestions } from './i18n/en';
import { itQuestions } from './i18n/it';
import { frQuestions } from './i18n/fr';
import { esQuestions } from './i18n/es';
import { ruQuestions } from './i18n/ru';
import { ptQuestions } from './i18n/pt';

import enUI from './i18n/ui/en';
import itUI from './i18n/ui/it';
import frUI from './i18n/ui/fr';
import esUI from './i18n/ui/es';
import ruUI from './i18n/ui/ru';
import ptUI from './i18n/ui/pt';


export const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];
export type AllUITranslationKeys = keyof typeof enUI;

type LocaleData = {
  ui: Record<AllUITranslationKeys, string>;
  questions: Question[];
};

const locales: Record<LanguageCode, LocaleData> = {
  en: { ui: enUI, questions: enQuestions },
  it: { ui: itUI, questions: itQuestions },
  fr: { ui: frUI, questions: frQuestions },
  es: { ui: esUI, questions: esQuestions },
  ru: { ui: ruUI, questions: ruQuestions },
  pt: { ui: ptUI, questions: ptQuestions },
};

export const getTranslator = (lang: LanguageCode) => {
    const uiStrings = locales[lang]?.ui || locales['en'].ui;

    return (key: AllUITranslationKeys, replacements?: Record<string, string | number>): string => {
        // FIX: Explicitly cast to string to handle cases where a translation key might be a number or symbol
        // and not found, preventing a crash on `.replace()` and satisfying the return type.
        let str = String(uiStrings[key] || key);
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                str = str.replace(`{${rKey}}`, String(replacements[rKey]));
            });
        }
        return str;
    };
}

export const getQuestionsForLanguage = (lang: LanguageCode): Question[] => {
    return locales[lang]?.questions || locales['en'].questions;
}