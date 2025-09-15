import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TopicForm } from './components/TopicForm';
import { PostCard } from './components/PostCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { SocialMediaPost } from './types';
import { generatePostIdeas } from './services/geminiService';
import { ShareButtons } from './components/ShareButtons';
import { Advertisement } from './components/Advertisement';
import { BannerAd } from './components/BannerAd';
import { ApiKeyInput } from './components/ApiKeyInput';
import { useTranslations, Language } from './lib/i18n';

const App: React.FC = () => {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [style, setStyle] = useState<string>('deep_metaphor');
  const [apiKey, setApiKey] = useState<string>('');
  const t = useTranslations(language);

  const handleGenerate = useCallback(async (topic: string) => {
    if (!apiKey) {
      setError(t('apiKeyError'));
      return;
    }
    if (!topic) {
      setError(t('topicError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setPosts([]);

    try {
      const postIdeas = await generatePostIdeas(topic, language, style, apiKey);
      setPosts(postIdeas);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  }, [language, style, apiKey, t]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans">
      <div 
        className="absolute inset-0 -z-10 h-full w-full"
        style={{
          backgroundColor: '#0a0a0a',
          backgroundImage: 'linear-gradient(to right, rgba(57, 255, 20, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(57, 255, 20, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      >
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-[#39ff14] opacity-20 blur-[120px]"></div>
      </div>
      
      <Header t={t} />
      
      <BannerAd />

      <main className="container mx-auto px-4 py-8">
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {t('appDescription')}
          </p>
          <div className="flex flex-col items-center gap-4 justify-center">
            <ApiKeyInput
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              isLoading={isLoading}
              t={t}
            />
            <TopicForm 
              onGenerate={handleGenerate} 
              isLoading={isLoading}
              language={language}
              onLanguageChange={(lang) => setLanguage(lang as Language)}
              style={style}
              onStyleChange={setStyle}
              t={t}
            />
          </div>
        </section>

        {error && (
          <div className="text-center my-8 bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-md max-w-2xl mx-auto font-orbitron">
            <p><strong>{t('systemError')}</strong> {error}</p>
          </div>
        )}

        <section className="mt-12">
          {isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner />
              <p className="text-[#39ff14] font-orbitron tracking-widest">{t('generatingPosts')}</p>
            </div>
          )}
          {posts.length > 0 && (
            <>
              <Advertisement />
              <ShareButtons t={t} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <PostCard key={index} post={post} apiKey={apiKey} t={t} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
