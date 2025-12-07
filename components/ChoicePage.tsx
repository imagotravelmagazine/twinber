import React from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';

interface ChoicePageProps {
  onStartQuiz: () => void;
  onStartComparison: () => void;
  onViewHistory: () => void;
  hasHistory: boolean;
  hasSavedProgress: boolean;
  onResumeQuiz: () => void;
  onLogin: () => void;
  isUserAuthenticated: boolean;
}

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-cyan-400"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-cyan-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mb-4 text-emerald-400"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);


const ChoicePage: React.FC<ChoicePageProps> = ({ onStartQuiz, onStartComparison, onViewHistory, hasHistory, hasSavedProgress, onResumeQuiz, onLogin, isUserAuthenticated }) => {
    const { t } = useAppContext();
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <Card className="w-full max-w-3xl">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 mb-8">
                    {t('choice_title')}
                </h1>

                {hasSavedProgress && (
                    <div 
                        className="group flex flex-col items-center p-8 mb-8 bg-emerald-900/30 rounded-2xl border-2 border-emerald-500 hover:bg-emerald-800/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        onClick={onResumeQuiz}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onResumeQuiz()}
                    >
                        <PlayIcon />
                        <h2 className="text-2xl font-bold text-emerald-300 mb-3">{t('choice_resume_title')}</h2>
                        <p className="text-slate-300 mb-6 flex-grow">{t('choice_resume_description')}</p>
                        <Button variant="primary" className="w-full pointer-events-none bg-emerald-500/80 group-hover:bg-emerald-500 text-slate-900">{t('choice_resume_button')}</Button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8">
                    <div 
                        className="group flex flex-col items-center p-8 bg-slate-800/50 rounded-2xl border border-slate-600 hover:border-cyan-500 hover:bg-slate-700/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        onClick={onStartQuiz}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onStartQuiz()}
                    >
                        <PencilIcon />
                        <h2 className="text-2xl font-bold text-slate-200 mb-3">{t('choice_option1_title')}</h2>
                        <p className="text-slate-400 mb-6 flex-grow">{hasSavedProgress ? t('choice_option1_description_warning') : t('choice_option1_description')}</p>
                        <Button variant="primary" className="w-full pointer-events-none group-hover:bg-cyan-600">{t('choice_option1_button')}</Button>
                    </div>
                     <div 
                        className="group flex flex-col items-center p-8 bg-slate-800/50 rounded-2xl border border-slate-600 hover:border-cyan-500 hover:bg-slate-700/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        onClick={onStartComparison}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onStartComparison()}
                    >
                        <UsersIcon />
                        <h2 className="text-2xl font-bold text-slate-200 mb-3">{t('choice_option2_title')}</h2>
                        <p className="text-slate-400 mb-6 flex-grow">{t('choice_option2_description')}</p>
                        <Button variant="primary" className="w-full pointer-events-none group-hover:bg-cyan-600">{t('choice_option2_button')}</Button>
                    </div>
                </div>

                {!isUserAuthenticated && (
                    <div className="mt-8 text-center">
                        <p className="text-slate-400 mb-2">{t('choice_login_prompt')}</p>
                        <Button variant="ghost" onClick={onLogin}>{t('choice_login_button')}</Button>
                    </div>
                )}

            </Card>
        </div>
    );
};

export default ChoicePage;