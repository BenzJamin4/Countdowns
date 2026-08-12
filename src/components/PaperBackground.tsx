import React from 'react';
import { PaperThemeConfig } from '../types';

interface Props {
  theme: PaperThemeConfig;
  children: React.ReactNode;
}

export const PaperBackground: React.FC<Props> = ({ theme, children }) => {
  return (
    <div
      className="min-h-screen py-6 px-2 sm:px-8 flex flex-col justify-start items-center transition-colors duration-300 font-mono"
      style={{
        backgroundColor: '#000000',
        fontFamily: theme.fontFamily,
      }}
    >
      <div
        className="notebook w-full max-w-[850px] h-auto shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border-2 relative flex flex-col my-2 transition-all duration-300 rounded-xs overflow-hidden"
        style={{
          backgroundColor: theme.paperBg,
          borderColor: theme.borderColor,
          minHeight: 'calc(min(100vw - 1rem, 850px) * (11 / 8.5))',
          paddingTop: '0px',
          paddingBottom: '0px',
          paddingRight: '0px',
          paddingLeft: '0px',
        }}
      >
        {/* Left Margin Red Line */}
        <div
          className="absolute top-0 bottom-0 left-[60px] w-[2px] opacity-60 pointer-events-none z-10"
          style={{ backgroundColor: theme.marginColor }}
        />

        {/* Notebook Content */}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
