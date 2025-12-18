
import React, { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  t: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, t }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '11111111') {
      onLoginSuccess();
    } else {
      setError(t.login_error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                {t.app_title}
            </h1>
            <p className="text-slate-400 mt-2 text-lg">{t.login_title}</p>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="bg-slate-800/50 p-8 rounded-lg shadow-lg border border-slate-700 space-y-6"
        >
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2">
              {t.password_label}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-cyan-500 transition-colors"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-yellow-400 transition-all"
            >
              {t.login_button}
            </button>
          </div>
        </form>
         <footer className="text-center pt-12 text-slate-500 text-sm">
            <p>
            <span className="text-green-500">{t.footer_copyright} </span>
            <span className="text-blue-500 font-bold">TIẾN DŨNG JXD</span>
            </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginScreen;
