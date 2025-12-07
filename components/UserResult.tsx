import React, { useMemo, useState } from 'react';
import { type UserData } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { COUPONS } from '../constants/questions';
import { enQuestions } from '../i18n/en';

interface UserResultProps {
  userData: UserData;
  onContinue: () => void;
  onReset: () => void;
  onRegister: () => void;
  isUserAuthenticated: boolean;
}

const UserResult: React.FC<UserResultProps> = ({ userData, onContinue, onReset, onRegister, isUserAuthenticated }) => {
  const { t, questions } = useAppContext();
  const [copied, setCopied] = useState(false);

  const uniqueCategories = useMemo(() => [...new Set(questions.map(q => q.category))], [questions]);
  const uniqueCategoriesEnglish = useMemo(() => [...new Set(enQuestions.map(q => q.category))], []);

  const handleShare = async () => {
    const shareText = t('user_result_share_message_text', { code: userData.code });
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('user_result_share_title'),
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.error("Share failed:", err);
        navigator.clipboard.writeText(userData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(userData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="text-center animate-fade-in-up w-full max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-red-500 [text-shadow:0_0_15px_theme(colors.red.500)] mb-4 break-words">
        {t('user_result_congratulations')}
      </h2>
      <p className="text-slate-300 text-xl mb-4">{t('user_result_code_intro')}</p>
      
      <div className="bg-slate-800/50 rounded-lg p-6 my-8 max-w-max mx-auto border border-slate-600">
        <p className="font-mono text-5xl md:text-7xl font-bold text-amber-400 tracking-widest [text-shadow:0_0_15px_theme(colors.amber.400)]">
          {userData.code}
        </p>
      </div>

      <div className="mb-8">
        <Button onClick={handleShare}>
          {copied ? t('user_result_copied_message') : t('user_result_share_code_button')}
        </Button>
      </div>

      {!isUserAuthenticated && (
        <div className="my-8 border-y border-slate-700 py-8 px-4 bg-slate-900/30 rounded-lg">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">{t('register_prompt_title')}</h3>
            <p className="text-slate-300 max-w-xl mx-auto mb-6">{t('register_prompt_text')}</p>
            <Button onClick={onRegister} variant='primary' className="w-full sm:w-auto text-lg">
                {t('register_button')}
            </Button>
        </div>
      )}

      <div className="mt-8 border-t border-slate-700 pt-8 text-left">
        <h3 className="text-2xl font-bold text-slate-200 mb-6 text-center">{t('user_result_coupons_title')}</h3>
        <ol className="list-decimal list-inside space-y-4 max-w-lg mx-auto text-slate-300">
          {uniqueCategories.map((category, index) => {
            const englishCategory = uniqueCategoriesEnglish[index];
            const coupon = COUPONS[englishCategory];
            const companyName = coupon?.company || `Azienda ${index + 1}`;
            const couponCode = coupon?.code || 'PROMO30';
            const companyUrl = coupon?.url || '#';

            return (
              <li key={index} className="bg-slate-800/40 p-4 rounded-lg">
                <div className="flex flex-col gap-3">
                    <div>
                        <span className="font-semibold text-slate-100">{category}:</span> 
                        <span className="font-mono ml-2 text-amber-400">{couponCode}</span>
                        <span className="text-slate-400 ml-2">({companyName})</span>
                    </div>
                    <Button 
                        onClick={() => window.open(companyUrl, '_blank', 'noopener,noreferrer')}
                        variant="ghost"
                        className="w-full sm:w-auto self-center !py-2 !px-4 text-sm"
                    >
                        {t('user_result_shop_now_button', { companyName })}
                    </Button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 border-t border-slate-700 pt-8">
        <Button onClick={onContinue} className="w-full sm:w-auto">{t('user_result_compare_button')}</Button>
        {!isUserAuthenticated && (
          <Button onClick={onReset} variant="secondary" className="w-full sm:w-auto bg-rose-800/50 hover:bg-rose-700/50 text-rose-400 border-rose-700 hover:border-rose-600 focus:ring-rose-500">{t('user_result_reset_button')}</Button>
        )}
      </div>
    </Card>
  );
};

export default UserResult;