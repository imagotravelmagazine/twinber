import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback, useEffect } from 'react';
import { getTranslator, getQuestionsForLanguage, LANGUAGES, LanguageCode, AllUITranslationKeys } from '../i18n';
import { Question } from '../types';

interface AppContextType {
    language: LanguageCode | null;
    setLanguage: (lang: LanguageCode | null) => void;
    t: (key: AllUITranslationKeys, replacements?: Record<string, string | number>) => string;
    questions: Question[];
    languages: typeof LANGUAGES;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    // Inizializza la lingua leggendo dal localStorage se disponibile
    const [language, setLanguage] = useState<LanguageCode | null>(() => {
        const savedLang = localStorage.getItem('twinber-language');
        return (savedLang as LanguageCode) || null;
    });

    const questions = useMemo(() => {
        return getQuestionsForLanguage(language || 'en');
    }, [language]);

    const t = useMemo(() => {
        return getTranslator(language || 'en'); 
    }, [language]);
    
    const setLanguageCallback = useCallback((lang: LanguageCode | null) => {
        setLanguage(lang);
        if (lang) {
            localStorage.setItem('twinber-language', lang);
        } else {
            localStorage.removeItem('twinber-language');
        }
    }, []);
    
    // Effetto per aggiornare il titolo della pagina e l'attributo lang dell'html
    useEffect(() => {
        if (language) {
            document.documentElement.lang = language;
        }
    }, [language]);
    
    const value = { language, setLanguage: setLanguageCallback, t, questions, languages: LANGUAGES };
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
