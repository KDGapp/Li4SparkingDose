import React, { useState } from 'react';
import type { TranslationKey } from '../lib/i18n';

interface TopicFormProps {
  onGenerate: (topic: string) => void;
  isLoading: boolean;
  language: string;
  onLanguageChange: (language: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  t: (key: TranslationKey) => string;
}

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
];

export const TopicForm: React.FC<TopicFormProps> = ({ onGenerate, isLoading, language, onLanguageChange, style, onStyleChange, t }) => {
  const [topic, setTopic] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(topic);
  };

  const styles = [
    { value: 'deep_metaphor', label: t('styleDeepMetaphor') },
    { value: 'simple_elegant', label: t('styleSimpleElegant') },
    { value: 'simple_truth', label: t('styleSimpleTruth') },
    { value: 'provocative_parable', label: t('styleProvocativeParable') },
    { value: 'insightful_question', label: t('styleInsightfulQuestion') },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-4 justify-center">
      <div className="w-full flex flex-col lg:flex-row items-center gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('topicPlaceholder')}
          className="w-full bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-4 py-3 focus:ring-2 focus:ring-[#39ff14] focus:border-[#39ff14] focus:outline-none transition duration-200 placeholder-gray-500"
          disabled={isLoading}
        />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full lg:w-48 bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-4 py-3 focus:ring-2 focus:ring-[#39ff14] focus:border-[#39ff14] focus:outline-none transition duration-200"
          disabled={isLoading}
        >
          {languages.map(lang => (
            <option key={lang.value} value={lang.value} className="bg-gray-900 text-white">{lang.label}</option>
          ))}
        </select>
        <select
          value={style}
          onChange={(e) => onStyleChange(e.target.value)}
          className="w-full lg:w-64 bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-4 py-3 focus:ring-2 focus:ring-[#39ff14] focus:border-[#39ff14] focus:outline-none transition duration-200"
          disabled={isLoading}
          aria-label={t('selectWritingStyle')}
        >
          {styles.map(s => (
            <option key={s.value} value={s.value} className="bg-gray-900 text-white">{s.label}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isLoading || !topic}
        className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-[#39ff14] text-black font-bold rounded-md hover:bg-white disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-widest shadow-[0_0_10px_#39ff14] hover:shadow-[0_0_20px_#39ff14]"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('processing')}
          </>
        ) : (
          t('generate')
        )}
      </button>
    </form>
  );
};
