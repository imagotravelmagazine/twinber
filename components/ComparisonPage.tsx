

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type AnswerData, type UserData, type Question } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { COUNTRIES } from '../constants/countries';
import { calculateCompatibility } from '../utils/helpers';

interface ComparisonPageProps {
  onCalculate: (data1: AnswerData, data2: AnswerData) => void;
  currentUserData?: UserData | null;
  archive: UserData[];
  questions: Question[];
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({ onCalculate, currentUserData, archive, questions }) => {
  const { t } = useAppContext();
  
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [comparisonError, setComparisonError] = useState('');

  const [searchUserCode, setSearchUserCode] = useState('');
  const [filters, setFilters] = useState({
    countries: [] as string[],
    gender: 'Any',
    minAge: 18,
    maxAge: 99,
    minCompatibility: 35,
  });
  const [searchResults, setSearchResults] = useState<(UserData & { compatibilityScore: number })[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);


  const sortedCountries = useMemo(() => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)), []);

  useEffect(() => {
    if (currentUserData) {
      setInput1(currentUserData.code);
      setSearchUserCode(currentUserData.code);
    }
  }, [currentUserData]);

  useEffect(() => {
    if (hasSearched) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasSearched, searchResults]);

  const handleDirectSubmit = () => {
    setComparisonError('');
    const code1 = input1.trim().toUpperCase();
    const code2 = input2.trim().toUpperCase();

    if (!code1 || !code2) {
        setComparisonError(t('comparison_error_invalid_code'));
        return;
    }

    if (code1 === code2) {
        setComparisonError(t('comparison_error_same_code'));
        return;
    }

    const allUsers = [
        ...(currentUserData ? [currentUserData] : []), 
        ...archive
    ].filter((user, index, self) => 
        index === self.findIndex(u => u.code === user.code)
    );

    const user1 = allUsers.find(u => u.code.toUpperCase() === code1);
    const user2 = allUsers.find(u => u.code.toUpperCase() === code2);

    if (!user1 || !user2) {
      setComparisonError(t('comparison_error_invalid_code'));
      return;
    }

    const data1: AnswerData = { code: user1.code, answers: user1.answers };
    const data2: AnswerData = { code: user2.code, answers: user2.answers };

    onCalculate(data1, data2);
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const unselectedCountries = useMemo(() => {
    if (filters.countries.includes('world')) return [];
    return sortedCountries.filter(c => !filters.countries.includes(c.code));
  }, [sortedCountries, filters.countries]);

  const handleCountrySelect = (countryCode: string) => {
    setFilters(prev => {
        if (countryCode === 'world') {
            return { ...prev, countries: ['world'] };
        }
        
        const currentSelection = prev.countries.filter(c => c !== 'world');
        if (currentSelection.includes(countryCode)) return prev;
        
        return { ...prev, countries: [...currentSelection, countryCode] };
    });
  };

  const handleRemoveCountry = (countryCode: string) => {
    setFilters(prev => ({
      ...prev,
      countries: prev.countries.filter(c => c !== countryCode)
    }));
  };

  const handleSearch = () => {
    setSearchError('');
    setHasSearched(false);
    setSearchResults([]);

    const code = searchUserCode.trim().toUpperCase();
    if (!code) {
      setSearchError(t('comparison_error_search_code_required'));
      return;
    }

    const allUsers = [ ...(currentUserData ? [currentUserData] : []), ...archive].filter((user, index, self) => index === self.findIndex(u => u.code === user.code));
    const searchUser = allUsers.find(u => u.code.toUpperCase() === code);

    if (!searchUser) {
      setSearchError(t('comparison_error_search_code_not_found'));
      return;
    }

    const otherUsers = archive.filter(user => user.code !== searchUser.code);

    const usersWithCompatibility = otherUsers.map(user => {
      const report = calculateCompatibility(
        { code: searchUser.code, answers: searchUser.answers },
        { code: user.code, answers: user.answers },
        questions
      );
      return { ...user, compatibilityScore: report.overallScore };
    });

    const filteredResults = usersWithCompatibility.filter(user => {
      if (user.compatibilityScore < Number(filters.minCompatibility)) return false;
      const userAge = Number(user.userInfo.age);
      if (userAge < Number(filters.minAge) || userAge > Number(filters.maxAge)) return false;
      if (filters.gender !== 'Any' && user.userInfo.gender !== filters.gender.toLowerCase()) return false;
      
      const effectiveCountries = filters.countries.length === 0 || filters.countries.includes('world') ? [] : filters.countries;
      if (effectiveCountries.length > 0 && !effectiveCountries.includes(user.userInfo.country)) return false;
      
      return true;
    });

    filteredResults.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    setSearchResults(filteredResults);
    setHasSearched(true);
  };

  const handleCompareFromSearch = (partnerData: UserData) => {
    const code = searchUserCode.trim().toUpperCase();
    const allUsers = [ ...(currentUserData ? [currentUserData] : []), ...archive].filter((user, index, self) => index === self.findIndex(u => u.code === user.code));
    const searchUser = allUsers.find(u => u.code.toUpperCase() === code);
    if (!searchUser) return;
    
    const data1: AnswerData = { code: searchUser.code, answers: searchUser.answers };
    const data2: AnswerData = { code: partnerData.code, answers: partnerData.answers };
    onCalculate(data1, data2);
  }

  const canCalculate = input1.trim().length > 0 && input2.trim().length > 0;
  const inputStyles = "w-full p-2 bg-slate-800/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500";
  const codeInputStyles = "w-full p-3 font-mono text-xl tracking-widest text-center bg-slate-700 border border-slate-600 rounded-md text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500";

  return (
    <Card className="w-full max-w-4xl animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-2 [text-shadow:0_0_10px_rgba(251,191,36,0.5)]">{t('comparison_title')}</h2>
        <p className="text-slate-50 text-center mb-8">
          {t('comparison_description')}
        </p>

        <div className="space-y-6">
          <div>
            <label htmlFor="user1" className="block text-sm font-medium text-slate-400 mb-2">
              {t('comparison_your_code_label')}
            </label>
            <input
              type="text"
              id="user1"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              className={codeInputStyles}
              maxLength={8}
              autoCapitalize="characters"
            />
          </div>
          <div>
            <label htmlFor="user2" className="block text-sm font-medium text-slate-400 mb-2">
              {t('comparison_partner_code_label')}
            </label>
            <input
              type="text"
              id="user2"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              className={codeInputStyles}
              maxLength={8}
              autoCapitalize="characters"
            />
          </div>
        </div>

        {comparisonError && <p className="text-red-400 text-center mt-6">{comparisonError}</p>}

        <div className="mt-8 flex flex-col gap-4">
          <Button onClick={handleDirectSubmit} disabled={!canCalculate} className="w-full text-lg">
            {t('comparison_calculate_button')}
          </Button>
        </div>
      </div>

      <div className="relative my-10"><hr className="border-slate-700" /></div>

      <div>
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-2 [text-shadow:0_0_10px_rgba(34,211,238,0.4)]">{t('comparison_find_users_title')}</h2>
        <p className="text-slate-50 text-center mb-8">
          {t('comparison_find_users_description')}
        </p>

        <div className="p-4 bg-slate-800/30 rounded-lg mt-6">
            <div>
              <label htmlFor="searchUserCode" className="block text-sm font-medium text-slate-400 mb-2">
                {t('comparison_your_code_label')}
              </label>
              <input
                type="text"
                id="searchUserCode"
                value={searchUserCode}
                onChange={(e) => setSearchUserCode(e.target.value)}
                className={codeInputStyles}
                maxLength={8}
                autoCapitalize="characters"
                placeholder="AAAA1111"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div className="md:col-span-1">
                    <label htmlFor="countries-list" className="block text-xs font-medium text-slate-400 mb-1">{t('comparison_country_filter_label')}</label>
                     <div id="countries-list" className={inputStyles + ' h-32 overflow-y-auto'}>
                      {!filters.countries.includes('world') && (
                          <>
                            <div 
                              onClick={() => handleCountrySelect('world')}
                              className="p-2 cursor-pointer rounded hover:bg-slate-700/80"
                            >
                              {t('comparison_country_world')}
                            </div>
                            <hr className="border-slate-700 my-1" />
                          </>
                      )}
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
                     {(filters.countries.length > 0) && (
                      <div className="mt-2 p-2 bg-slate-800/50 rounded-md max-h-24 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {filters.countries.map(countryCode => {
                            const countryName = countryCode === 'world' 
                                ? t('comparison_country_world') 
                                : sortedCountries.find(c => c.code === countryCode)?.name;
                            
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
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <label htmlFor="gender" className="block text-xs font-medium text-slate-400 mb-1">{t('comparison_gender_filter_label')}</label>
                        <select id="gender" name="gender" value={filters.gender} onChange={handleFilterChange} className={inputStyles}>
                            <option value="Any">{t('comparison_gender_any')}</option>
                            <option value="Male">{t('userInfo_gender_male')}</option>
                            <option value="Female">{t('userInfo_gender_female')}</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                              <label htmlFor="minAge" className="block text-xs font-medium text-slate-400 mb-1">{t('comparison_min_age_label')}</label>
                              <input type="number" id="minAge" name="minAge" value={filters.minAge} onChange={handleFilterChange} className={inputStyles + ' text-center'} />
                        </div>
                        <div>
                            <label htmlFor="maxAge" className="block text-xs font-medium text-slate-400 mb-1">{t('comparison_max_age_label')}</label>
                            <input type="number" id="maxAge" name="maxAge" value={filters.maxAge} onChange={handleFilterChange} className={inputStyles + ' text-center'} />
                        </div>
                    </div>
                </div>
            </div>
             <div className="my-4">
                <label htmlFor="minCompatibility" className="block text-sm font-medium text-slate-400 mb-2 text-center">
                  {t('comparison_min_compatibility_label')}: {filters.minCompatibility}%
                </label>
                <input 
                    type="range" 
                    id="minCompatibility" 
                    name="minCompatibility" 
                    min="0" 
                    max="100" 
                    value={filters.minCompatibility} 
                    onChange={handleFilterChange} 
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
            {searchError && <p className="text-red-400 text-center mb-4">{searchError}</p>}
            <Button onClick={handleSearch} className="w-full">{t('comparison_search_button')}</Button>
        </div>

        {hasSearched && (
              <div className="mt-6" ref={resultsRef}>
                <h3 className="text-xl font-bold text-slate-300 mb-4">{t('comparison_results_title')}</h3>
                {searchResults.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {searchResults.map(user => (
                            <div key={user.code} className="bg-slate-800/60 p-3 rounded-lg flex items-center justify-between gap-4 transition-all hover:bg-slate-700/60">
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-200">{user.userInfo.name}</p>
                                    <p className="text-slate-400 text-sm">{`${user.userInfo.age}, ${t(user.userInfo.gender === 'male' ? 'userInfo_gender_male' : 'userInfo_gender_female')}, ${sortedCountries.find(c => c.code === user.userInfo.country)?.name || user.userInfo.country}`}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">{t('comparison_compatibility_score')}</p>
                                    <p className="font-bold text-cyan-400 text-lg">{user.compatibilityScore}%</p>
                                </div>
                                <Button onClick={() => handleCompareFromSearch(user)} variant="ghost" className="px-4 py-2 text-sm">
                                    {t('comparison_compare_button')}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-4">{t('comparison_no_results')}</p>
                )}
              </div>
        )}
      </div>
    </Card>
  );
};

export default ComparisonPage;