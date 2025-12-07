import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { useAppContext } from '../contexts/AppContext';
import { auth, signInWithEmailAndPassword } from '../firebase';

interface UserLoginPageProps {
  onLoginSuccess: () => void;
}

const UserLoginPage: React.FC<UserLoginPageProps> = ({ onLoginSuccess }) => {
  const { t } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError(t('login_error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full p-3 bg-slate-800/50 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm animate-fade-in-up">
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">{t('user_login_title')}</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-100 mb-2">
              {t('login_email_label')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-100 mb-2">
              {t('login_password_label')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles}
              required
            />
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full text-lg" disabled={isLoading}>
              {isLoading ? t('questionnaire_loading') : t('login_button')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserLoginPage;