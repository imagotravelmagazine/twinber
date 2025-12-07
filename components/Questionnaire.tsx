
import React, { useState, useMemo, useEffect } from 'react';
import ProgressBar from './common/ProgressBar';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { COUPONS } from '../constants/questions';
import { enQuestions } from '../i18n/en';
import { type UserInfo } from '../types';

interface QuestionnaireProps {
  onComplete: (answers: number[]) => Promise<void>;
  userInfo: UserInfo;
  initialProgress: {
    answers: (number | null)[];
    currentQuestionIndex: number;
  } | null;
  onSaveAndExit: () => void;
}

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 text-emerald-400 mx-auto mb-4">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

const LogoTemplate: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
    <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        <foreignObject width="200" height="50">
            <div className="flex items-center justify-center h-full w-full gap-4 text-slate-800" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div className="w-8 h-8">{icon}</div>
                <div className="font-bold text-xl tracking-tight text-center">{text}</div>
            </div>
        </foreignObject>
    </svg>
);

const LOGO_ICONS: Record<string, React.ReactNode> = {
  "Food and Drink": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M5 12h14"/></svg>,
  "Hobbies": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 2-7-2-7 2v10l7 2 7-2 7 2V2z"/><path d="M11 2v20"/></svg>,
  "Movies and TV": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></svg>,
  "Music": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  "Books and Reading": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  "Travel": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  "Social Life": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  "Home Life": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  "Health and Wellness": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  "Career and Ambition": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V2"/><path d="m5 9 7-7 7 7"/></svg>,
  "Finances": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22V2"/><path d="M5 12h14"/></svg>, // Simplified dollar sign
  "Technology and Social Media": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>,
  "Humor": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>,
  "Aesthetics and Style": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H20s2 0 2 2v5.5"/><path d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/><path d="M18 7 8.7 16.3a1 1 0 0 1-1.4 0L3 12"/></svg>,
  "Nature and Outdoors": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>,
  "Communication Style": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  "Emotional Approach": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  "Values and Beliefs": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m13 13-6-6"/><path d="m13 3 7.07 7.07"/><path d="M3 13l7.07 7.07"/></svg>,
  "Relationship Dynamics": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 17a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/><path d="M14 7a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5Z"/></svg>,
  "Future Goals": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
};


const categoryColors = [
    { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20' },
    { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500', shadow: 'shadow-rose-500/20' },
    { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20' },
    { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-500/20' },
    { text: 'text-violet-400', bg: 'bg-violet-500', border: 'border-violet-500', shadow: 'shadow-violet-500/20' },
    { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500', shadow: 'shadow-rose-500/20' },
    { text: 'text-lime-400', bg: 'bg-lime-500', border: 'border-lime-500', shadow: 'shadow-lime-500/20' },
    { text: 'text-pink-400', bg: 'bg-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500/20' },
    { text: 'text-blue-400', bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500/20' },
    { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500', shadow: 'shadow-green-500/20' },
    { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500/20' },
    { text: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500', shadow: 'shadow-yellow-500/20' },
    { text: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500', shadow: 'shadow-indigo-500/20' },
    { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-red-500/20' },
    { text: 'text-teal-400', bg: 'bg-teal-500', border: 'border-teal-500', shadow: 'shadow-teal-500/20' },
    { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500', border: 'border-fuchsia-500', shadow: 'shadow-fuchsia-500/20' },
    { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500/20' },
    { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500/20' },
    { text: 'text-sky-400', bg: 'bg-sky-500', border: 'border-sky-500', shadow: 'shadow-sky-500/20' },
    { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20' },
];

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, userInfo, initialProgress, onSaveAndExit }) => {
  const { t, questions } = useAppContext();
  
  const options = useMemo(() => [
    { label: t('questionnaire_option_no'), value: 0 },
    { label: t('questionnaire_option_yes'), value: 1 },
  ], [t]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialProgress?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<(number | null)[]>(initialProgress?.answers || new Array(questions.length).fill(null));
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Only save if the quiz has started (at least one answer given, or not on the very first question)
    if (currentQuestionIndex > 0 || answers.some(a => a !== null)) {
      const progress = {
        answers,
        currentQuestionIndex,
        userInfo,
      };
      try {
        localStorage.setItem('twinber-quiz-progress', JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save quiz progress', error);
      }
    }
  }, [answers, currentQuestionIndex, userInfo]);

  const uniqueCategories = useMemo(() => [...new Set(questions.map(q => q.category))], [questions]);
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswer = (value: number) => {
    if (isAnimating) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
    setIsAnimating(true);

    setTimeout(() => {
        const isLastQuestionOverall = currentQuestionIndex === questions.length - 1;
        const questionsInCurrentCategory = questions.filter(q => q.category === currentQuestion.category);
        const currentIndexInCategory = questionsInCurrentCategory.findIndex(q => q.text === currentQuestion.text);
        const isLastInCategory = currentIndexInCategory === questionsInCurrentCategory.length - 1;

        if (isLastQuestionOverall) {
            setIsCompleting(true);
            onComplete(newAnswers.filter(a => a !== null) as number[])
              .catch(err => {
                console.error("Failed to complete quiz:", err);
                setIsCompleting(false);
              });
        } else if (isLastInCategory) {
            setAnimationClass('animate-fade-out');
            setTimeout(() => {
                setShowInterstitial(true);
                setIsAnimating(false);
            }, 200);
        } else {
            setAnimationClass('animate-slide-out-left');
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
                setAnimationClass('animate-slide-in-right');
                setIsAnimating(false);
            }, 200);
        }
    }, 100);
  };
  
  const handleBack = () => {
    if (currentQuestionIndex === 0 || isAnimating) return;

    setIsAnimating(true);
    setAnimationClass('animate-slide-out-right');

    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnimationClass('animate-slide-in-left');
      setIsAnimating(false);
    }, 200);
  };

  const handleContinueToNextCategory = () => {
    setShowInterstitial(false);
    setCurrentQuestionIndex(prev => prev + 1);
    setAnimationClass('animate-fade-in');
  };

  if (isCompleting) {
    return (
      <Card className="text-center animate-fade-in">
        <div className="py-16">
          <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-slate-300">{t('questionnaire_completing_title')}</h2>
          <p className="text-slate-400 mt-2">{t('questionnaire_completing_message')}</p>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return <Card>{t('questionnaire_loading')}</Card>;
  }
    
  const currentCategory = currentQuestion.category;
  const currentCategoryIndex = uniqueCategories.indexOf(currentCategory);
  const categoryTitle = `${currentCategoryIndex + 1}. ${currentCategory}`;
  const currentColor = categoryColors[currentCategoryIndex % categoryColors.length];
    
  const questionsInCurrentCategory = useMemo(() => questions.filter(q => q.category === currentCategory), [questions, currentCategory]);
  const totalQuestionsInCategory = questionsInCurrentCategory.length;
  const currentIndexInCategory = questionsInCurrentCategory.findIndex(q => q.text === currentQuestion.text);

  if (showInterstitial) {
    const uniqueCategoriesEnglish = [...new Set(enQuestions.map(q => q.category))];
    const englishCategory = uniqueCategoriesEnglish[currentCategoryIndex];
    const couponInfo = COUPONS[englishCategory];
    const companyName = couponInfo?.company || t('interstitial_default_company_name');
    const SponsorLogo = couponInfo ? () => <LogoTemplate text={companyName} icon={LOGO_ICONS[englishCategory]} /> : null;


    return (
      <Card className="text-center animate-fade-in">
        <CheckCircleIcon />
        <h2 className="text-3xl font-bold text-emerald-400 mb-2">{t('interstitial_title')}</h2>
        <p className="text-slate-300 text-lg mb-2">{t('interstitial_subtitle', { sectionNumber: currentCategoryIndex + 1, categoryName: currentCategory })}</p>
        
        <p className="text-slate-300 my-4">
            {t('interstitial_coupon_message_part1')}{' '}
            <span className="font-bold text-xl text-white uppercase tracking-wider">{t('interstitial_coupon_highlight')}</span>
            {' '}{t('interstitial_coupon_message_part2', { companyName: companyName })}
        </p>

        {SponsorLogo && (
            <div className="w-full h-36 bg-white/95 rounded-lg flex items-center justify-center my-6 p-2 shadow-inner shadow-slate-900/10">
                <SponsorLogo />
            </div>
        )}

        <p className="text-slate-200 mb-8">{t('interstitial_coupon_message_2')}</p>

        <Button onClick={handleContinueToNextCategory}>
          {t('questionnaire_next_category_button')}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      {/* Static Content */}
      <div className="mb-4 text-center">
        <h2 className={`text-3xl font-extrabold ${currentColor.text}`}>{categoryTitle}</h2>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-sm text-slate-400">
          <span>{t('questionnaire_progress', { current: currentIndexInCategory + 1, total: totalQuestionsInCategory })}</span>
          <span className={`font-bold ${currentColor.text}`}>{currentQuestion.category}</span>
        </div>
        <ProgressBar current={currentIndexInCategory + 1} total={totalQuestionsInCategory} colorClass={currentColor.bg} />
      </div>

      {/* Animated Question Text */}
      <div className="relative min-h-[9rem] flex items-center justify-center overflow-hidden mb-8">
        <div className={`w-full text-center ${animationClass}`}>
          <p className="text-2xl md:text-3xl font-medium text-slate-200">
            {questions[currentQuestionIndex].text}
          </p>
        </div>
      </div>

      {/* Static Content */}
      <div className="flex justify-center gap-4 mb-8">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            disabled={isAnimating}
            className={`w-36 py-4 rounded-lg text-xl font-bold transition-all duration-200 transform hover:scale-105 border ${
              currentAnswer === option.value
                ? `${currentColor.bg} text-slate-900 ${currentColor.border} shadow-lg ${currentColor.shadow}`
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-500 hover:border-slate-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700">
        <Button onClick={handleBack} disabled={currentQuestionIndex === 0 || isAnimating} variant="secondary">
          {t('questionnaire_back_button')}
        </Button>
        <Button onClick={onSaveAndExit} variant="ghost">
          {t('questionnaire_save_and_exit_button')}
        </Button>
      </div>
    </Card>
  );
};

export default Questionnaire;