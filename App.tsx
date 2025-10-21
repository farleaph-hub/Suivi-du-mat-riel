import React, { useState } from 'react';
import { User, Page } from './types';
import LoginScreen from './pages/LoginScreen';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import MaterielPage from './pages/MaterielPage';
import QuiEstOuPage from './pages/QuiEstOuPage';
import ScannerPage from './pages/ScannerPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('materiel');

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('materiel'); // Reset to default page on login
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderPage = () => {
    if (!user) return null;
    switch (currentPage) {
      case 'materiel':
        return <MaterielPage user={user} />;
      case 'qui-est-ou':
        return <QuiEstOuPage />;
      case 'scanner':
        return <ScannerPage user={user} />;
      default:
        return <MaterielPage user={user} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <TopHeader user={user} onLogout={handleLogout} currentPage={currentPage} />
      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {renderPage()}
        </div>
      </main>
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default App;