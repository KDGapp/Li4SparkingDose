import React from 'react';
import type { TranslationKey } from '../lib/i18n';

interface HeaderProps {
  t: (key: TranslationKey) => string;
}

export const Header: React.FC<HeaderProps> = ({ t }) => {
  return (
    <header className="py-6 border-b border-[#39ff14]/20">
      <div className="container mx-auto px-4 text-center">
        <h1 
          className="text-4xl md:text-5xl font-bold font-orbitron"
        >
          <span 
            className="text-[#39ff14]"
            style={{ textShadow: '0 0 5px #39ff14, 0 0 10px #39ff14' }}
          >
            Li 4 sparking dose
          </span>
        </h1>
        <p className="mt-3 text-gray-400 text-lg tracking-wider">
          {t('appSlogan')}
        </p>
      </div>
    </header>
  );
};
