import React, { useRef } from 'react';
import { PaperStyle, PaperThemeConfig, Category } from '../types';
import { PAPER_THEMES } from '../data/paperThemes';
import { Search, Plus, Download, Upload, Palette, Filter } from 'lucide-react';

interface Props {
  onOpenModal: () => void;
  onDownloadData: () => void;
  onUploadData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetDefaultData: () => void;
  currentTheme: PaperThemeConfig;
  onSelectTheme: (theme: PaperStyle) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories?: string[];
  useEmojiButtons: boolean;
  onToggleEmojiButtons: () => void;
  count: number;
}

export const NotebookHeader: React.FC<Props> = ({
  onOpenModal,
  onDownloadData,
  onUploadData,
  onResetDefaultData,
  currentTheme,
  onSelectTheme,
  selectedCategory,
  onCategoryChange,
  categories = [],
  useEmojiButtons,
  onToggleEmojiButtons,
  count,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="flex flex-col z-10">
      {/* Row 1 (0 - 40px): Blank top space without line */}
      <div className="h-[40px] shrink-0" />

      {/* Row 2: Title & Action Controls */}
      <div
        className="flex flex-wrap justify-between items-center pl-[4.5rem] pr-[1.5rem] min-h-[40px] border-b"
        style={{ color: currentTheme.textColor, borderColor: currentTheme.lineColor }}
      >
        <div className="flex items-center gap-3 min-w-0 h-[40px]">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight truncate">
            {count} {count === 1 ? 'Countdown' : 'Countdowns'}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 h-[40px] ml-auto sm:ml-0">
          {/* Download JSON Data button */}
          <button
            type="button"
            onClick={onDownloadData}
            className="btn h-[28px] w-[28px] flex items-center justify-center bg-white/70 hover:bg-white border border-black/15 text-sm rounded-xs cursor-pointer transition-transform active:scale-95"
            title="Download JSON Export (💾)"
          >
            <span>💾</span>
          </button>

          {/* Upload JSON Data button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn h-[28px] w-[28px] flex items-center justify-center bg-white/70 hover:bg-white border border-black/15 text-sm rounded-xs cursor-pointer transition-transform active:scale-95"
            title="Upload JSON Backup (📂)"
          >
            <span>📂</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onUploadData}
            accept=".json"
            hidden
            id="upload-input"
          />

          {/* Paper Theme Picker */}
          <div className="relative inline-block">
            <select
              value={currentTheme.id}
              onChange={(e) => onSelectTheme(e.target.value as PaperStyle)}
              className="appearance-none h-[28px] pl-2 pr-5 bg-white/70 hover:bg-white text-slate-800 rounded-xs font-mono text-[11px] cursor-pointer focus:outline-none font-bold border border-black/15"
              title="Change Paper Theme"
            >
              {Object.values(PAPER_THEMES).map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] opacity-60">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Category Filter Pills & New button (all in one wrapping row aligned to 40px paper lines) */}
      <div
        className={`flex flex-wrap items-center pl-[4.5rem] pr-[1.5rem] gap-1.5 text-xs font-mono min-h-[40px] ${
          count === 0 ? 'border-b' : ''
        }`}
        style={{ borderColor: currentTheme.lineColor }}
      >
        <div className="flex flex-wrap items-center gap-1.5 shrink min-w-0 min-h-[40px] py-1 flex-1">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`h-[28px] px-2.5 rounded-xs border transition-all flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-black text-white font-bold border-black'
                : 'bg-white/50 border-black/10 hover:bg-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onCategoryChange('pinned')}
            className={`h-[28px] px-2.5 rounded-xs border transition-all flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0 ${
              selectedCategory === 'pinned'
                ? 'bg-black text-white font-bold border-black'
                : 'bg-white/50 border-black/10 hover:bg-white'
            }`}
          >
            📌 Pinned
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`h-[28px] px-2.5 rounded-xs border transition-all flex items-center justify-center cursor-pointer whitespace-nowrap capitalize shrink-0 ${
                selectedCategory.trim().toLowerCase() === cat.trim().toLowerCase()
                  ? 'bg-black text-white font-bold border-black'
                  : 'bg-white/50 border-black/10 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Add Countdown button on right of last category line */}
          <button
            type="button"
            onClick={onOpenModal}
            className="btn h-[28px] px-2.5 bg-black text-white hover:bg-slate-800 rounded-xs text-xs font-mono font-bold uppercase cursor-pointer flex items-center gap-1 transition-transform active:scale-95 shadow-xs shrink-0 ml-auto"
            title="Add New Countdown (➕)"
          >
            <span>➕</span>
            <span>New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
