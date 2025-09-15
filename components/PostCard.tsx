import React, { useState } from 'react';
import type { SocialMediaPost } from '../types';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ImageIcon } from './icons/ImageIcon';
import { ImageEditorModal } from './ImageEditorModal';
import type { TranslationKey } from '../lib/i18n';

interface PostCardProps {
  post: SocialMediaPost;
  apiKey: string;
  t: (key: TranslationKey) => string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, apiKey, t }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const fullPostText = `${post.content}\n\n${post.hashtags.map(tag => `#${tag}`).join(' ')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPostText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert(t('copyFail'));
    }
  };

  return (
    <>
      <div className="bg-black/50 backdrop-blur-sm border border-[#39ff14]/30 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[#39ff14]/20 hover:border-[#39ff14]/80 animate-fade-in flex flex-col h-full">
        <div className="p-5 flex-grow flex flex-col">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap flex-grow">{post.content}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="text-xs bg-[#39ff14]/10 text-[#39ff14] px-2 py-1 rounded-md font-mono">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        {/* Action Buttons Box */}
        <div className="p-2 bg-black/20 border-t border-[#39ff14]/30 flex items-center justify-center gap-2 mt-auto">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 text-sm bg-transparent hover:bg-[#39ff14]/10 border-2 border-[#39ff14]/50 hover:border-[#39ff14] text-[#39ff14] font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:hover:bg-transparent"
            disabled={isCopied}
          >
            <ClipboardIcon />
            {isCopied ? t('copied') : t('copy')}
          </button>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm bg-[#39ff14]/80 hover:bg-[#39ff14] text-black font-bold py-2 px-4 rounded-md transition-all duration-200"
          >
            <ImageIcon />
            {t('createImage')}
          </button>
        </div>
      </div>
      {isEditorOpen && (
        <ImageEditorModal 
          post={post}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          apiKey={apiKey}
          t={t}
        />
      )}
    </>
  );
};
