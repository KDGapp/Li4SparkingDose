import React from 'react';
import { TwitterIcon, FacebookIcon, WhatsAppIcon, TikTokIcon } from './icons/PlatformIcons';
import type { TranslationKey } from '../lib/i18n';

interface ShareButtonsProps {
  t: (key: TranslationKey) => string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ t }) => {
  const pageUrl = window.location.href;
  const shareText = "Check out these cool social media post ideas I generated with Li 4 sparking dose!";

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`,
    tiktok: `https://www.tiktok.com/`, // TikTok does not have a direct web share link, so we link to the main page.
  };

  const HexagonButton: React.FC<{ href: string; title: string; children: React.ReactNode }> = ({ href, title, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="relative w-12 h-[52px] flex items-center justify-center bg-black/50 text-white hover:text-[#39ff14] transition-colors duration-200 group"
      title={title}
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        boxShadow: 'inset 0 0 10px #39ff14, 0 0 10px #39ff14',
      }}></div>
      <div className="relative z-10">
        {children}
      </div>
    </a>
  );


  return (
    <div className="my-8 flex flex-col items-center justify-center gap-4 animate-fade-in">
      <h3 className="text-lg font-orbitron tracking-widest text-gray-300">{t('shareThisAI')}</h3>
      <div className="flex items-center gap-4">
        <HexagonButton href={shareLinks.twitter} title={t('shareOnTwitter')}>
          <TwitterIcon />
        </HexagonButton>
        <HexagonButton href={shareLinks.facebook} title={t('shareOnFacebook')}>
          <FacebookIcon />
        </HexagonButton>
        <HexagonButton href={shareLinks.whatsapp} title={t('shareOnWhatsApp')}>
          <WhatsAppIcon />
        </HexagonButton>
        <HexagonButton href={shareLinks.tiktok} title={t('visitTikTok')}>
          <TikTokIcon />
        </HexagonButton>
      </div>
    </div>
  );
};
