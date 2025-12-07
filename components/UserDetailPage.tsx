import React from 'react';
import { type UserData, type Question } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { exportUserQAToCSV } from '../utils/helpers';
import { COUNTRIES } from '../constants/countries';

interface UserDetailPageProps {
  user: UserData;
  questions: Question[];
}

const UserDetailPage: React.FC<UserDetailPageProps> = ({ user, questions }) => {
  const { t } = useAppContext();

  const handleExport = () => {
    exportUserQAToCSV(
        user, 
        questions,
        t('userDetail_question_header'),
        t('userDetail_answer_header'),
        t('questionnaire_option_yes'),
        t('questionnaire_option_no')
    );
  };
  
  const getGenderTranslation = (gender: string) => {
    if (gender === 'male') return t('userInfo_gender_male');
    if (gender === 'female') return t('userInfo_gender_female');
    return gender;
  }

  return (
    <Card className="w-full max-w-4xl animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-8">{t('userDetail_title', { name: user.userInfo.name })}</h2>
      
      {/* User Info Section */}
      <div className="mb-8 p-4 bg-slate-900/50 rounded-lg">
        <h3 className="text-xl font-bold text-slate-300 mb-4">{t('userDetail_info_title')}</h3>
        <div className="grid grid-cols-2 gap-4 text-slate-300">
          <p><strong>{t('userInfo_name_label')}:</strong> {user.userInfo.name}</p>
          <p><strong>{t('userInfo_age_label')}:</strong> {user.userInfo.age}</p>
          <p><strong>{t('userInfo_gender_label')}:</strong> {getGenderTranslation(user.userInfo.gender)}</p>
          <p><strong>{t('userInfo_country_label')}:</strong> {COUNTRIES.find(c => c.code === user.userInfo.country)?.name || user.userInfo.country}</p>
        </div>
      </div>

      {/* Answers Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-300 mb-4">{t('userDetail_answers_title')}</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 font-bold text-slate-400 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-2 z-10">
              <div>{t('userDetail_question_header')}</div>
              <div>{t('userDetail_answer_header')}</div>
          </div>
          {questions.map((question, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto] gap-x-4 items-center bg-slate-800/40 p-3 rounded-md">
              <p className="text-slate-300">{question.text}</p>
              <p className={`font-bold text-center w-16 ${user.answers[index] === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {user.answers[index] === 1 ? t('questionnaire_option_yes') : t('questionnaire_option_no')}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-slate-700 pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={handleExport} variant="ghost">
          {t('userDetail_export_qa_button')}
        </Button>
      </div>
    </Card>
  );
};

export default UserDetailPage;