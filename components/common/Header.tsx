import React from 'react';
import { AllUITranslationKeys } from '../../i18n';

interface HeaderProps {
    onBack: (() => void) | null;
    onHome: () => void;
    onMessages: () => void;
    showMessagesIcon: boolean;
    t: (key: AllUITranslationKeys, replacements?: Record<string, string | number>) => string;
    onLogout: () => void;
    isUserAuthenticated: boolean;
}

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M19 12H5" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const MessagesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);


const Header: React.FC<HeaderProps> = ({ onBack, onHome, onMessages, showMessagesIcon, t, onLogout, isUserAuthenticated }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-sm z-20 p-4 flex justify-between items-center w-full">
            <div className="flex gap-2">
                 {onBack && <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-cyan-400/10"
                    aria-label={t('questionnaire_back_button')}
                    title={t('questionnaire_back_button')}
                >
                    <BackIcon />
                </button>}
                <button
                    onClick={onHome}
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-cyan-400/10"
                    aria-label={t('nav_home_button_aria_label')}
                    title={t('nav_home_button_aria_label')}
                >
                    <HomeIcon />
                </button>
                 {showMessagesIcon && <button
                    onClick={onMessages}
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-2 rounded-full hover:bg-cyan-400/10"
                    aria-label={t('nav_messages_button_aria_label')}
                    title={t('nav_messages_button_aria_label')}
                >
                    <MessagesIcon />
                </button>}
            </div>
            {isUserAuthenticated && (
                <button
                    onClick={onLogout}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-rose-400/10"
                    aria-label={t('logout_button')}
                    title={t('logout_button')}
                >
                    <LogoutIcon />
                </button>
            )}
        </header>
    );
};

export default Header;