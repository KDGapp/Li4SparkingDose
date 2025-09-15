import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons/VisibilityIcons';
import type { TranslationKey } from '../lib/i18n';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isLoading: boolean;
  t: (key: TranslationKey) => string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange, isLoading, t }) => {
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const inputId = 'google-ai-api-key';

  return (
    <div className="w-full flex flex-col gap-2 items-center">
      <label 
        htmlFor={inputId}
        className="font-orbitron text-gray-300 uppercase tracking-widest text-sm"
      >
        {t('apiKeyLabel')}
      </label>
      <div className="w-full relative">
        <input
          id={inputId}
          type={isKeyVisible ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={t('apiKeyPlaceholder')}
          className="w-full bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md pl-4 pr-36 py-3 focus:ring-2 focus:ring-[#39ff14] focus:border-[#39ff14] focus:outline-none transition duration-200 placeholder-gray-500"
          disabled={isLoading}
          aria-label="Google AI API Key"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#39ff14]/80 text-black font-bold py-1 px-3 rounded-md hover:bg-white transition-all duration-200 uppercase tracking-widest mr-2 flex-shrink-0"
            aria-label={t('getApiKey') + ' (opens in a new tab)'}
          >
            {t('getApiKey')}
          </a>
          <button
            type="button"
            onClick={() => setIsKeyVisible(!isKeyVisible)}
            className="p-1 text-gray-400 hover:text-[#39ff14]"
            aria-label={isKeyVisible ? t('hideApiKey') : t('showApiKey')}
          >
            {isKeyVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};
