import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-dashed rounded-full animate-spin-slow border-[#39ff14]/50"></div>
      <div className="absolute inset-2 border-4 border-dotted rounded-full animate-spin-medium border-[#39ff14]/70"></div>
      <div className="absolute inset-4 border-4 border-solid rounded-full animate-spin-fast border-[#39ff14]"></div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-medium {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-spin-medium { animation: spin-medium 2s linear infinite; }
        .animate-spin-fast { animation: spin-fast 1s linear infinite; }
      `}</style>
    </div>
  );
};