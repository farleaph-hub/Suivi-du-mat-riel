import React from 'react';
import { Page } from '../types';
import { ToolboxIcon } from './icons/ToolboxIcon';
import { UsersIcon } from './icons/UsersIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClasses = 'text-cyan-400';
  const inactiveClasses = 'text-gray-500';

  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center flex-1 transition-colors focus:outline-none">
      <Icon className={`w-6 h-6 mb-1 ${isActive ? activeClasses : inactiveClasses}`} />
      <span className={`text-xs font-medium uppercase ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'materiel', label: 'MATÉRIEL', icon: ToolboxIcon },
    { id: 'qui-est-ou', label: 'QUI EST OÙ?', icon: UsersIcon },
    { id: 'scanner', label: 'SCANNER', icon: QrCodeIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-700 flex z-20">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={currentPage === item.id}
          onClick={() => onNavigate(item.id as Page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;