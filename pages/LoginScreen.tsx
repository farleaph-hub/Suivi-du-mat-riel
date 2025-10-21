import React, { useState } from 'react';
import { LogoIcon } from '../components/icons/LogoIcon';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return; 
    }
    const role = name.toLowerCase().includes('admin') ? 'admin' : 'user';
    onLogin({ name: name.trim(), role });
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
            <LogoIcon className="w-16 h-16 mx-auto text-cyan-400" />
            <h2 className="mt-6 text-3xl font-bold">
                Bienvenue
            </h2>
            <p className="mt-2 text-gray-400">Entrez votre nom pour commencer.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="sr-only">Votre nom</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="appearance-none relative block w-full px-4 py-3 bg-gray-900 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
              placeholder="Votre nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-black bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
            >
              Entrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
