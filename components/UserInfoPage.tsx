import React, { useState, useMemo } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { type UserInfo } from '../types';
import { COUNTRIES } from '../constants/countries';

interface UserInfoPageProps {
  onContinue: (info: UserInfo) => void;
}

const UserInfoPage: React.FC<UserInfoPageProps> = ({ onContinue }) => {
  const { t } = useAppContext();
  const [info, setInfo] = useState<UserInfo>({ name: '', age: '', gender: '', country: '' });
  const [error, setError] = useState('');

  const sortedCountries = useMemo(() => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: name === 'age' ? (value === '' ? '' : parseInt(value, 10)) : value }));
  };

  const handleSubmit = () => {
    if (!info.name || !info.age || !info.gender || !info.country) {
      setError(t('userInfo_error_required'));
      return;
    }
    setError('');
    onContinue(info as UserInfo);
  };

  const isFormValid = info.name && info.age && info.gender && info.country;
  const inputStyles = "w-full p-3 bg-slate-800/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500";

  return (
    <Card className="w-full max-w-lg animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">{t('userInfo_title')}</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-100 mb-2">
            {t('userInfo_name_label')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={info.name}
            onChange={handleChange}
            placeholder={t('userInfo_name_placeholder')}
            className={inputStyles}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-100 mb-2">
                {t('userInfo_age_label')}
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={info.age}
                onChange={handleChange}
                min="13"
                max="120"
                className={inputStyles}
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-slate-100 mb-2">
                {t('userInfo_gender_label')}
              </label>
              <select
                id="gender"
                name="gender"
                value={info.gender}
                onChange={handleChange}
                className={inputStyles}
              >
                <option value="" disabled hidden></option>
                <option value="male">{t('userInfo_gender_male')}</option>
                <option value="female">{t('userInfo_gender_female')}</option>
              </select>
            </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-slate-100 mb-2">
            {t('userInfo_country_label')}
          </label>
          <select
            id="country"
            name="country"
            value={info.country}
            onChange={handleChange}
            className={inputStyles}
          >
            <option value="" disabled>{t('userInfo_country_placeholder')}</option>
            {sortedCountries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {error && <p className="text-red-400 text-center mt-6">{error}</p>}

      <div className="mt-8 flex flex-col gap-4">
        <Button onClick={handleSubmit} disabled={!isFormValid} className="w-full text-lg">
          {t('userInfo_continue_button')}
        </Button>
      </div>
    </Card>
  );
};

export default UserInfoPage;