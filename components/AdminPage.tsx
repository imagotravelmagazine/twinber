

import React, { useState, useMemo } from 'react';
import { type CompatibilityReport, type UserData, type Question } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { exportFilteredUsersToCSV } from '../utils/helpers';
import { COUNTRIES } from '../constants/countries';

interface AdminPageProps {
  reports: CompatibilityReport[];
  archive: UserData[];
  questions: Question[];
  onViewReport: (report: CompatibilityReport) => void;
  onViewUserDetail: (user: UserData) => void;
  onClearHistory: () => void;
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ reports, archive, questions, onViewReport, onViewUserDetail, onClearHistory, onLogout }) => {
  const { t } = useAppContext();
  const sortedCountries = useMemo(() => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)), []);
  
  const [filters, setFilters] = useState({
    answer: '1',
    questions: '',
    gender: 'any',
    minAge: '',
    maxAge: '',
    countries: [] as string[],
  });
  const [filteredUsers, setFilteredUsers] = useState<UserData[] | null>(null);
  const [filterError, setFilterError] = useState('');

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const unselectedCountries = useMemo(() => {
    return sortedCountries.filter(c => !filters.countries.includes(c.code));
  }, [sortedCountries, filters.countries]);

  const handleCountrySelect = (countryCode: string) => {
    setFilters(prev => {
        if (prev.countries.includes(countryCode)) return prev;
        return { ...prev, countries: [...prev.countries, countryCode] };
    });
  };

  const handleRemoveCountry = (countryCode: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.filter(c => c !== countryCode)
    }));
  };

  const handleFilter = () => {
    setFilteredUsers(null);
    setFilterError('');

    let questionNumbers: number[] = [];
    let questionIndices: number[] = [];

    if (filters.questions.trim() !== '') {
        questionNumbers = filters.questions.split(',')
            .map(q => q.trim())
            .filter(q => q !== '')
            .map(q => parseInt(q, 10));

        if (questionNumbers.some(isNaN)) {
            setFilterError(t('admin_filter_error_invalid_numbers'));
            return;
        }

        questionIndices = questionNumbers.map(n => n - 1);

        if (questionIndices.some(i => i < 0 || i >= questions.length)) {
            setFilterError(t('admin_filter_error_out_of_range', { questionCount: questions.length }));
            return;
        }
    }

    const answerToMatch = parseInt(filters.answer, 10);

    const results = archive.filter(user => {
        // Gender filter
        if (filters.gender !== 'any' && user.userInfo.gender !== filters.gender) {
            return false;
        }

        // Age filter
        const age = Number(user.userInfo.age);
        if (filters.minAge && age < parseInt(filters.minAge, 10)) {
            return false;
        }
        if (filters.maxAge && age > parseInt(filters.maxAge, 10)) {
            return false;
        }

        // Country filter
        if (filters.countries.length > 0 && !filters.countries.includes(user.userInfo.country)) {
            return false;
        }

        // Question/Answer filter
        if (questionIndices.length > 0) {
            if (!questionIndices.every(qIndex => user.answers[qIndex] === answerToMatch)) {
                return false;
            }
        }

        return true;
    });

    setFilteredUsers(results);
  };

  const handleExportFiltered = () => {
    if (!filteredUsers || filteredUsers.length === 0) return;

    let questionNumbers: number[] = [];

    if (filters.questions.trim() !== '') {
        questionNumbers = filters.questions.split(',')
            .map(q => q.trim())
            .filter(q => q !== '')
            .map(q => parseInt(q, 10));

        if (questionNumbers.some(isNaN)) {
            setFilterError(t('admin_filter_error_export_invalid'));
            return;
        }
    }

    exportFilteredUsersToCSV(
        filteredUsers, 
        questionNumbers, 
        questions, 
        t('questionnaire_option_yes'), 
        t('questionnaire_option_no')
    );
  };
  
  const inputStyles = "w-full p-2 bg-slate-800/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500";


  return (
    <Card className="w-full max-w-4xl animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-center text-cyan-400">{t('admin_title')}</h2>
        <Button onClick={onLogout} variant="secondary">{t('logout_button')}</Button>
      </div>
      
      {/* User Archive Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-300 mb-4">{t('admin_users_title')} ({archive.length})</h3>
        {archive.length === 0 ? (
          <p className="text-slate-400 text-center">{t('admin_no_users')}</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg">
            {archive.map((user, index) => (
              <div key={index} className="bg-slate-800/60 p-3 rounded-lg flex items-center justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-slate-300">
                    {user.userInfo.name} <span className="text-xs text-slate-500 font-mono ml-2">({user.code})</span>
                  </p>
                  <p className="text-slate-400 text-sm">{user.userInfo.age} / {sortedCountries.find(c => c.code === user.userInfo.country)?.name || user.userInfo.country}</p>
                </div>
                <Button onClick={() => onViewUserDetail(user)} variant="ghost" className="px-4 py-2 text-sm">
                  {t('admin_view_detail_button')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW Filter Section */}
      <div className="my-8 border-t border-slate-700 pt-6">
        <h3 className="text-2xl font-bold text-slate-300 mb-4">{t('admin_filter_title')}</h3>
        <div className="bg-slate-900/50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-4">
            <div>
                <label className="text-sm text-slate-400 mb-1 block">{t('admin_filter_answer_label')}</label>
                <select name="answer" value={filters.answer} onChange={handleFilterChange} className={inputStyles}>
                <option value="1">{t('questionnaire_option_yes')}</option>
                <option value="0">{t('questionnaire_option_no')}</option>
                </select>
            </div>
            <div>
                <label className="text-sm text-slate-400 mb-1 block">{t('admin_filter_questions_label')}</label>
                <input 
                type="text" 
                name="questions"
                placeholder={t('admin_filter_questions_placeholder')} 
                value={filters.questions}
                onChange={handleFilterChange}
                className={inputStyles}
                />
            </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label htmlFor="gender" className="text-sm text-slate-400 mb-1 block">{t('admin_filter_gender_label')}</label>
                <select id="gender" name="gender" value={filters.gender} onChange={handleFilterChange} className={inputStyles}>
                <option value="any">{t('admin_filter_gender_any')}</option>
                <option value="male">{t('userInfo_gender_male')}</option>
                <option value="female">{t('userInfo_gender_female')}</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className="text-sm text-slate-400 mb-1 block">{t('admin_filter_age_range_label')}</label>
                <div className="grid grid-cols-2 gap-2">
                <input type="number" name="minAge" value={filters.minAge} onChange={handleFilterChange} placeholder={t('comparison_min_age_label')} className={inputStyles + ' text-center'} />
                <input type="number" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} placeholder={t('comparison_max_age_label')} className={inputStyles + ' text-center'} />
                </div>
            </div>
            </div>
            <div>
              <label htmlFor="countries-list" className="text-sm text-slate-400 mb-1 block">{t('admin_filter_country_label')}</label>
              <div id="countries-list" className={inputStyles + ' h-32 overflow-y-auto'}>
                {unselectedCountries.map(c => (
                    <div 
                        key={c.code} 
                        onClick={() => handleCountrySelect(c.code)}
                        className="p-2 cursor-pointer rounded hover:bg-slate-700"
                    >
                        {c.name}
                    </div>
                ))}
              </div>

              {filters.countries.length > 0 && (
                <div className="mt-2 p-2 bg-slate-800/50 rounded-md max-h-24 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                      {filters.countries.map(countryCode => {
                          const countryName = sortedCountries.find(c => c.code === countryCode)?.name;
                          if (!countryName) return null;

                          return (
                            <div key={countryCode} className="bg-cyan-900/70 text-cyan-300 text-sm px-2 py-1 rounded-full flex items-center gap-2">
                              <span>{countryName}</span>
                              <button
                                onClick={() => handleRemoveCountry(countryCode)}
                                className="text-cyan-500 hover:text-cyan-200 font-bold text-lg leading-4"
                                aria-label={`Remove ${countryName}`}
                              >
                                &times;
                              </button>
                            </div>
                          );
                      })}
                  </div>
                </div>
              )}
            </div>
            <div className="pt-2">
              <Button onClick={handleFilter} className="w-full">{t('admin_filter_button')}</Button>
            </div>

            {filterError && <p className="text-red-400 mt-2 text-center">{filterError}</p>}
        </div>

        {filteredUsers !== null && (
          <div className="mt-6">
            <h4 className="text-xl font-bold text-slate-400 mb-2">{t('admin_filter_results_title', {count: filteredUsers.length})}</h4>
            {filteredUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-4">{t('admin_filter_no_results')}</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                {filteredUsers.map((user, index) => (
                  <div key={index} className="bg-slate-800/60 p-3 rounded-lg flex items-center justify-between gap-4">
                     <div className="flex-grow">
                      <p className="font-semibold text-slate-300">
                        {user.userInfo.name} <span className="text-xs text-slate-500 font-mono ml-2">({user.code})</span>
                      </p>
                      <p className="text-slate-400 text-sm">{user.userInfo.age} / {sortedCountries.find(c => c.code === user.userInfo.country)?.name || user.userInfo.country}</p>
                    </div>
                    <Button onClick={() => onViewUserDetail(user)} variant="ghost" className="px-4 py-2 text-sm">
                      {t('admin_view_detail_button')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {filteredUsers.length > 0 && 
              <div className="text-center mt-4">
                <Button onClick={handleExportFiltered} variant="ghost">{t('admin_filter_export_button')}</Button>
              </div>
            }
          </div>
        )}
      </div>

      {/* Reports History Section */}
      <div>
        <h3 className="text-2xl font-bold text-slate-300 mb-4">{t('admin_reports_title')}</h3>
        {reports.length === 0 ? (
          <p className="text-slate-400 text-center">{t('history_no_reports')}</p>
        ) : (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 bg-slate-900/50 p-4 rounded-lg">
            {reports.map((report, index) => (
              <div key={index} className="bg-slate-800/60 p-4 rounded-lg flex items-center justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-semibold text-slate-300">
                    {t('history_report_with', { 
                      code1: report.user1Info?.name || report.user1Code, 
                      code2: report.user2Info?.name || report.user2Code 
                    })}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {t('result_overall_score_label')}: <span className="font-bold text-cyan-400">{report.overallScore}%</span>
                  </p>
                </div>
                <Button onClick={() => onViewReport(report)} variant="ghost" className="px-4 py-2 text-sm">
                  {t('history_view_report_button')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-slate-700 pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
        {reports.length > 0 && (
          <Button onClick={onClearHistory} variant="secondary" className="bg-rose-800/50 hover:bg-rose-700/50 text-rose-400 border-rose-700 hover:border-rose-600 focus:ring-rose-500">
            {t('history_clear_button')}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default AdminPage;