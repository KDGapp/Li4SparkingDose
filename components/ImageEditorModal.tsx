import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SocialMediaPost } from '../types';
import { generateImageFromPrompt } from '../services/geminiService';
import { ShareIcon } from './icons/ShareIcon';
import type { TranslationKey } from '../lib/i18n';

interface ImageEditorModalProps {
  post: SocialMediaPost;
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  t: (key: TranslationKey) => string;
}

const FONT_FACES = ['Orbitron', 'Roboto', 'Playfair Display', 'Lora', 'Caveat', 'Bebas Neue'];
const CANVAS_MAX_WIDTH = 1080;


const AccordionSection: React.FC<{title: string, id: string, isOpen: boolean, onToggle: (id: string) => void, children: React.ReactNode}> = ({ title, id, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-[#39ff14]/30">
      <button onClick={() => onToggle(id)} className="w-full flex justify-between items-center py-3 text-left focus:outline-none">
        <h4 className="text-lg font-semibold text-gray-200 uppercase tracking-wider">{title}</h4>
        <svg className={`w-5 h-5 text-[#39ff14] transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && <div className="pb-4 space-y-4 animate-fade-in">{children}</div>}
    </div>
  );
};

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ post, isOpen, onClose, apiKey, t }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'failed'>('idle');

  // Background Controls
  const [bgOpacity, setBgOpacity] = useState(100);
  const [bgBlur, setBgBlur] = useState(0);

  // Effects (still used by templates)
  const [bgFilter, setBgFilter] = useState('none');
  const [gradientOverlay, setGradientOverlay] = useState('none');

  // Text properties
  const [text, setText] = useState(post.content);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState('Orbitron');
  const [textYPosition, setTextYPosition] = useState(50); // percentage
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');

  // Text outline properties
  const [textStrokeEnabled, setTextStrokeEnabled] = useState(false);
  const [textStrokeColor, setTextStrokeColor] = useState('#000000');
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);

  const [openAccordion, setOpenAccordion] = useState<string | null>('background');

  const ASPECT_RATIOS: Record<string, { name: string; ratio: number }> = {
    '1:1': { name: t('aspectSquare'), ratio: 1 / 1 },
    '4:5': { name: t('aspectPortrait'), ratio: 5 / 4 },
    '16:9': { name: t('aspectLandscape'), ratio: 9 / 16 },
    '9:16': { name: t('aspectStory'), ratio: 16 / 9 },
  };

  const bannerTemplates = [
    {
      name: t('templateNeon'),
      settings: {
        fontFamily: 'Orbitron',
        fontSize: 64,
        textColor: '#39ff14',
        textStrokeEnabled: true,
        textStrokeColor: '#000000',
        textStrokeWidth: 2,
        gradientOverlay: 'neon-fade',
        bgFilter: 'none',
        bgBlur: 2,
        textAlign: 'center' as const,
        textYPosition: 50,
      },
    },
    {
      name: t('templateElegant'),
      settings: {
        fontFamily: 'Playfair Display',
        fontSize: 56,
        textColor: '#FFFFFF',
        textStrokeEnabled: true,
        textStrokeColor: '#000000',
        textStrokeWidth: 1,
        gradientOverlay: 'none',
        bgFilter: 'grayscale',
        bgBlur: 0,
        textAlign: 'center' as const,
        textYPosition: 50,
      },
    },
    {
      name: t('templateBold'),
      settings: {
        fontFamily: 'Bebas Neue',
        fontSize: 80,
        textColor: '#FFFFFF',
        textStrokeEnabled: true,
        textStrokeColor: '#000000',
        textStrokeWidth: 4,
        gradientOverlay: 'none',
        bgFilter: 'none',
        bgBlur: 0,
        textAlign: 'left' as const,
        textYPosition: 20,
      },
    },
  ];

  const triggerPopUnderAd = () => {
    const adUrl = 'https://niecesprivilegelimelight.com/h0rgx6ec3?key=7bbd81061fe6c36353d2a52215756a5c';
    const adWindow = window.open(adUrl, '_blank');

    if (!adWindow) {
      console.warn('Pop-up ad was blocked by the browser.');
    }
  };

  const applyTemplate = useCallback((settings: typeof bannerTemplates[0]['settings']) => {
    setFontFamily(settings.fontFamily);
    setFontSize(settings.fontSize);
    setTextColor(settings.textColor);
    setTextStrokeEnabled(settings.textStrokeEnabled);
    if (settings.textStrokeColor) setTextStrokeColor(settings.textStrokeColor);
    if (settings.textStrokeWidth) setTextStrokeWidth(settings.textStrokeWidth);
    setGradientOverlay(settings.gradientOverlay);
    setBgFilter(settings.bgFilter);
    setBgBlur(settings.bgBlur);
    setTextAlign(settings.textAlign);
    setTextYPosition(settings.textYPosition);
  }, []);

  const handleAccordionToggle = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const wrapText = useCallback((
    context: CanvasRenderingContext2D, 
    textToWrap: string, 
    maxWidth: number
  ) => {
    const words = textToWrap.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = context.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
  }, []);


  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const ar = ASPECT_RATIOS[aspectRatio].ratio;
    canvas.width = CANVAS_MAX_WIDTH;
    canvas.height = CANVAS_MAX_WIDTH * ar;

    // Apply background filters
    let filterString = '';
    if (bgBlur > 0) filterString += `blur(${bgBlur}px) `;
    if (bgFilter === 'grayscale') filterString += 'grayscale(100%) ';
    if (bgFilter === 'invert') filterString += 'invert(100%) ';
    if (bgFilter === 'cyberpunk') filterString += 'contrast(1.5) saturate(2) ';
    ctx.filter = filterString.trim();

    // Draw image with object-fit: cover logic and opacity
    ctx.globalAlpha = bgOpacity / 100;
    const imgAspectRatio = image.height / image.width;
    let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
    if (ar > imgAspectRatio) { // Canvas is taller
      sHeight = image.height;
      sWidth = sHeight / ar;
      sx = (image.width - sWidth) / 2;
    } else { // Image is taller
      sWidth = image.width;
      sHeight = sWidth * ar;
      sy = (image.height - sHeight) / 2;
    }
    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.filter = 'none';

    // Draw Scanlines effect
    if (bgFilter === 'scanlines') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        for (let i = 0; i < canvas.height; i += 4) {
            ctx.fillRect(0, i, canvas.width, 2);
        }
    }

    // Draw gradient overlay
    if (gradientOverlay !== 'none') {
        let gradient: CanvasGradient | null = null;
        if (gradientOverlay === 'neon-fade') {
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(57, 255, 20, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        }
        if (gradient) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        // Add a default dark overlay for readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw Text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px '${fontFamily}'`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';
    
    if (textStrokeEnabled) {
      ctx.strokeStyle = textStrokeColor;
      ctx.lineWidth = textStrokeWidth * 2; // Multiply by 2 for better visual weight
      ctx.lineJoin = 'round';
    }
    
    const textX = textAlign === 'center' ? canvas.width / 2 : textAlign === 'left' ? 40 : canvas.width - 40;
    const maxWidth = canvas.width - 80;
    const lines = wrapText(ctx, text, maxWidth);
    
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (canvas.height * (textYPosition / 100)) - (totalTextHeight / 2);

    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight) + (lineHeight / 2);
      if (textStrokeEnabled) {
        ctx.strokeText(line, textX, y);
      }
      ctx.fillText(line, textX, y);
    });

  }, [image, aspectRatio, text, textColor, fontSize, fontFamily, textYPosition, textAlign, wrapText, bgOpacity, bgBlur, bgFilter, gradientOverlay, textStrokeEnabled, textStrokeColor, textStrokeWidth, ASPECT_RATIOS]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => { setImage(img); };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
        const prompt = `Social media post about: ${post.content}`;
        const base64Image = await generateImageFromPrompt(prompt, apiKey);
        const img = new Image();
        img.onload = () => { setImage(img); };
        img.src = `data:image/jpeg;base64,${base64Image}`;
    } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : t('imageGenError'));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = () => {
     triggerPopUnderAd();
     const canvas = canvasRef.current;
     if (!canvas) return;
     const link = document.createElement('a');
     link.download = `sparking-dose-${post.platform.toLowerCase()}.jpg`;
     link.href = canvas.toDataURL('image/jpeg', 0.9);
     link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!navigator.share) {
      alert(t('shareFailMessage'));
      console.error("Web Share API is not supported in this browser.");
      setShareStatus('failed');
      setTimeout(() => setShareStatus('idle'), 3000);
      return;
    }

    setShareStatus('sharing');

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Could not create image blob to share.');
        setShareStatus('failed');
        setTimeout(() => setShareStatus('idle'), 3000);
        return;
      }

      const file = new File([blob], `sparking-dose-${post.platform.toLowerCase()}.jpg`, { type: 'image/jpeg' });
      const shareData = {
        files: [file],
        title: `My ${post.platform} Post Image`,
        text: post.content,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setShareStatus('idle');
        } catch (err) {
          console.log("Share action was cancelled or failed:", err);
          setShareStatus('idle');
        }
      } else {
        console.error("Your browser doesn't support sharing these files.");
        setShareStatus('failed');
        setTimeout(() => setShareStatus('idle'), 3000);
      }
    }, 'image/jpeg', 0.9);
  };

  const getShareButtonText = () => {
    switch(shareStatus) {
        case 'sharing': return t('sharing');
        case 'failed': return t('shareFailed');
        default: return t('share');
    }
  }


  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-[#0c0c0c] border-2 border-[#39ff14]/50 rounded-lg shadow-2xl shadow-[#39ff14]/10 w-[95vw] lg:w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Controls */}
        <div className="w-full lg:w-96 h-1/2 lg:h-auto lg:flex-shrink-0 bg-black/30 lg:border-r-2 border-b-2 lg:border-b-0 border-[#39ff14]/50 p-4 flex flex-col font-orbitron">
          <h3 className="text-xl font-bold text-[#39ff14] mb-4" style={{ textShadow: '0 0 4px #39ff14' }}>{t('imageEditorTitle')}</h3>
          
          <div className="overflow-y-auto flex-grow pr-2">
            <AccordionSection title={t('background')} id="background" isOpen={openAccordion === 'background'} onToggle={handleAccordionToggle}>
              <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 bg-[#39ff14]/80 text-black font-bold rounded-md hover:bg-white transition-all duration-200 uppercase tracking-widest">{t('uploadImage')}</button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <button
                onClick={handleGenerateImage}
                disabled={!apiKey || isGenerating}
                title={!apiKey ? t('apiKeyTooltip') : t('generateTooltip')}
                className="w-full relative mt-2 px-4 py-2 flex items-center justify-center bg-transparent border-2 border-[#39ff14]/50 text-[#39ff14] font-bold rounded-md transition-all duration-200 uppercase tracking-widest enabled:hover:bg-[#39ff14]/20 enabled:hover:border-[#39ff14] disabled:text-gray-600 disabled:border-gray-600 disabled:cursor-not-allowed"
              >
                 {isGenerating ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                )}
                {isGenerating ? t('generating') : t('generateWithAI')}
              </button>
              
              {image && <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('aspectRatio')}</label>
                  <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-[#39ff14] focus:outline-none"><option value="" disabled>Select</option>{Object.entries(ASPECT_RATIOS).map(([k,v])=><option key={k} value={k} className="bg-gray-900">{v.name}</option>)}</select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('opacity')}: {bgOpacity}%</label>
                  <input type="range" min="0" max="100" value={bgOpacity} onChange={e => setBgOpacity(Number(e.target.value))} className="w-full h-2 bg-black/50 border border-[#39ff14]/50 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('blur')}: {bgBlur}px</label>
                  <input type="range" min="0" max="20" value={bgBlur} onChange={e => setBgBlur(Number(e.target.value))} className="w-full h-2 bg-black/50 border border-[#39ff14]/50 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
              </>}
            </AccordionSection>

            {image && <>
            <AccordionSection title={t('bannerTemplates')} id="templates" isOpen={openAccordion === 'templates'} onToggle={handleAccordionToggle}>
              <div className="grid grid-cols-1 gap-2">
                {bannerTemplates.map(template => (
                  <button
                    key={template.name}
                    onClick={() => applyTemplate(template.settings)}
                    className="w-full p-3 border-2 border-[#39ff14]/50 rounded-md text-left transition-all hover:bg-[#39ff14]/20 hover:border-[#39ff14] focus:outline-none focus:ring-2 focus:ring-[#39ff14]"
                  >
                    <span 
                      className="font-bold text-lg tracking-wider"
                      style={{
                        fontFamily: `'${template.settings.fontFamily}', sans-serif`,
                        color: template.settings.textColor,
                        WebkitTextStroke: template.settings.textStrokeEnabled ? `${template.settings.textStrokeWidth / 2}px ${template.settings.textStrokeColor}` : 'none',
                        paintOrder: 'stroke fill',
                      }}
                    >
                      {template.name}
                    </span>
                  </button>
                ))}
              </div>
            </AccordionSection>

            <AccordionSection title={t('text')} id="text" isOpen={openAccordion === 'text'} onToggle={handleAccordionToggle}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-[#39ff14] focus:outline-none font-sans"></textarea>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('fontFamily')}</label>
                  <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-black/50 border-2 border-[#39ff14]/50 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-[#39ff14] focus:outline-none font-sans">
                      {FONT_FACES.map(font => (
                          <option key={font} value={font} className="bg-gray-900" style={{ fontFamily: `'${font}', sans-serif` }}>{font}</option>
                      ))}
                  </select>
                </div>
                <div className="flex items-end">
                    <div className="flex items-center gap-2">
                        <label htmlFor="textColor" className="text-sm font-medium text-gray-300 uppercase tracking-wider">{t('color')}</label>
                        <input id="textColor" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-10 rounded-md border-2 border-[#39ff14]/50 bg-black/50 cursor-pointer" />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('fontSize')}: {fontSize}px</label>
                <input type="range" min="16" max="128" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full h-2 bg-black/50 border border-[#39ff14]/50 rounded-lg appearance-none cursor-pointer range-thumb" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('vPosition')}: {textYPosition}%</label>
                <input type="range" min="0" max="100" value={textYPosition} onChange={e => setTextYPosition(Number(e.target.value))} className="w-full h-2 bg-black/50 border border-[#39ff14]/50 rounded-lg appearance-none cursor-pointer range-thumb" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('alignment')}</label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (<button key={align} onClick={() => setTextAlign(align as any)} className={`px-4 py-2 text-sm rounded-md border-2 uppercase transition-colors ${textAlign === align ? 'bg-[#39ff14] text-black border-[#39ff14]' : 'bg-black/50 border-[#39ff14]/50 hover:bg-[#39ff14]/20'}`}>{align}</button>))}
                </div>
              </div>
              <div className="border-t border-[#39ff14]/30 mt-4 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <h5 className="text-md font-semibold text-gray-200 uppercase tracking-wider">{t('outline')}</h5>
                    <label htmlFor="strokeToggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="strokeToggle" className="sr-only peer" checked={textStrokeEnabled} onChange={() => setTextStrokeEnabled(!textStrokeEnabled)} />
                        <div className="w-11 h-6 bg-black/50 border border-[#39ff14]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39ff14]"></div>
                    </label>
                </div>
                {textStrokeEnabled && <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <label htmlFor="textStrokeColor" className="text-sm font-medium text-gray-300 uppercase tracking-wider">{t('color')}</label>
                        <input id="textStrokeColor" type="color" value={textStrokeColor} onChange={e => setTextStrokeColor(e.target.value)} className="w-10 h-10 rounded-md border-2 border-[#39ff14]/50 bg-black/50 cursor-pointer" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wider">{t('width')}: {textStrokeWidth}px</label>
                        <input type="range" min="1" max="10" value={textStrokeWidth} onChange={e => setTextStrokeWidth(Number(e.target.value))} className="w-full h-2 bg-black/50 border border-[#39ff14]/50 rounded-lg appearance-none cursor-pointer range-thumb" />
                    </div>
                </div>}
              </div>
            </AccordionSection>
            </>}
          </div>

          {image && (
            <div className="pt-4 mt-auto border-t-2 border-[#39ff14]/50 flex items-center gap-2">
              <button 
                onClick={handleDownload} 
                className="flex-1 px-4 py-3 bg-green-500 text-black font-bold rounded-md hover:bg-green-400 transition-all duration-200 uppercase tracking-widest shadow-[0_0_10px_#39ff14] hover:shadow-[0_0_20px_#39ff14] flex items-center justify-center gap-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.293V3a1 1 0 112 0v8.293l1.293-1.586a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  {t('download')}
              </button>
              {navigator.share && (
                <button 
                  onClick={handleShare} 
                  disabled={shareStatus !== 'idle'}
                  title={shareStatus === 'failed' ? t('shareFailMessage') : t('share')}
                  className={`flex-1 px-4 py-3 font-bold rounded-md transition-all duration-200 uppercase tracking-widest flex items-center justify-center gap-2
                    ${shareStatus === 'failed' ? 'bg-red-900/50 border-2 border-red-500 text-red-400 cursor-not-allowed' :
                    'bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500/20 disabled:border-gray-600 disabled:text-gray-600 disabled:cursor-not-allowed'
                    }`
                  }
                >
                    <ShareIcon />
                    {getShareButtonText()}
                </button>
              )}
            </div>
          )}

        </div>
        {/* Canvas */}
        <div className="flex-1 bg-black/80 flex items-center justify-center p-2 lg:p-4 min-h-0">
          {image ? (
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-md"></canvas>
          ) : (
            <div 
              className="w-full h-full border-2 border-dashed border-[#39ff14]/50 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-[#39ff14]/10 hover:border-[#39ff14] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#39ff14]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="mt-4 text-lg font-semibold font-orbitron text-[#39ff14]">{t('uploadPlaceholderTitle')}</p>
              <p className="text-sm text-gray-500">{t('uploadPlaceholderSubtitle')}</p>
            </div>
          )}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white hover:text-[#39ff14] transition-colors z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
       <style>{`
        .range-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #39ff14;
            cursor: pointer;
            border-radius: 2px;
            box-shadow: 0 0 5px #39ff14;
        }
        .range-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #39ff14;
            cursor: pointer;
            border-radius: 2px;
            border: none;
            box-shadow: 0 0 5px #39ff14;
        }
      `}</style>
    </div>
  );
};
