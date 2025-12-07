
import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { LanguageCode } from '../i18n';

interface HomePageProps {
  onStart: () => void;
  onViewAdmin: () => void;
}

const HeartIcon = () => (
    // FIX: Corrected incomplete viewBox attribute.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 mr-2 text-cyan-400">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
);

const GlobeIcon = () => (
    // FIX: Corrected incomplete viewBox attribute.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-slate-400 absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

const SettingsIcon = () => (
    // FIX: Corrected malformed viewBox attribute which was causing multiple parsing errors.
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);


const HomePage: React.FC<HomePageProps> = ({ onStart, onViewAdmin }) => {
    const { language, setLanguage, t, languages } = useAppContext();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value as LanguageCode);
    };

    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <Card className="w-full max-w-2xl relative">
                <button
                    onClick={onViewAdmin}
                    className="absolute bottom-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors z-10 p-2 rounded-full hover:bg-cyan-400/10 opacity-60 hover:opacity-100"
                    aria-label={t('admin_title')}
                    title={t('admin_title')}
                >
                    <SettingsIcon />
                </button>
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-2 [text-shadow:0_0_10px_rgba(34,211,238,0.4)]">
                    Twinber
                </h1>
                <p className="text-amber-400 text-lg mb-8">
                    {t('home_subtitle')}
                </p>

                <div className="max-w-xs mx-auto mb-8">
                    <label htmlFor="language-select" className="sr-only">{t('home_select_language_label')}</label>
                     <div className="relative">
                        <GlobeIcon />
                        <select
                            id="language-select"
                            value={language || ''}
                            onChange={handleLanguageChange}
                            className="w-full px-10 py-3 text-center bg-slate-700/50 border border-slate-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300"
                        >
                            <option value="" disabled>{t('home_select_language_placeholder')}</option>
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {language && (
                    <div className="animate-fade-in-up">
                        <p className="text-slate-300 text-xl mb-8 font-special font-semibold">
                            {t('home_description')}
                        </p>
                        
                        <div className="text-left space-y-4 mb-10 text-slate-300">
                            <div className="flex items-start"><strong className="text-cyan-400 font-semibold mr-2 w-8 text-center">1.</strong> <span>{t('home_step1')}</span></div>
                            <div className="flex items-start"><strong className="text-cyan-400 font-semibold mr-2 w-8 text-center">2.</strong> <span>{t('home_step2')}</span></div>
                            <div className="flex items-start"><strong className="text-cyan-400 font-semibold mr-2 w-8 text-center">3.</strong> <span>{t('home_step3')}</span></div>
                            <div className="flex items-start"><strong className="text-cyan-400 font-semibold mr-2 w-8 text-center">4.</strong> <span>{t('home_step4')}</span></div>
                        </div>
                        
                        <Button onClick={onStart} className="w-full text-lg flex items-center justify-center">
                            <HeartIcon />
                            {t('home_start_button')}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default HomePage;
