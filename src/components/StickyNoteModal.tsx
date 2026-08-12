import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CountdownItem, FormatUnit } from '../types';
import { Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<CountdownItem, 'id'> & { id?: number }) => void;
  initialItem?: CountdownItem | null;
  existingCategories?: string[];
}

const ALL_FORMATS: { id: FormatUnit; label: string }[] = [
  { id: 'years', label: 'Years' },
  { id: 'months', label: 'Months' },
  { id: 'weeks', label: 'Weeks' },
  { id: 'days', label: 'Days' },
  { id: 'hours', label: 'Hours' },
  { id: 'minutes', label: 'Minutes' },
];

const STICKY_COLORS = [
  { id: 'yellow', bg: '#fff9c4', border: '#fef08a', text: '#451a03' },
  { id: 'pink', bg: '#fce7f3', border: '#fbcfe8', text: '#831843' },
  { id: 'green', bg: '#dcfce7', border: '#bbf7d0', text: '#14532d' },
  { id: 'blue', bg: '#e0f2fe', border: '#bae6fd', text: '#0c4a6e' },
] as const;

export const StickyNoteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  existingCategories = [],
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formats, setFormats] = useState<FormatUnit[]>(['weeks', 'days']);
  const [notes, setNotes] = useState('');
  const [stickyColor, setStickyColor] = useState<'yellow' | 'pink' | 'green' | 'blue'>('yellow');

  // Category tags state
  const [boxedCategories, setBoxedCategories] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setStartDate(initialItem.startDate || '');
      setStartTime(initialItem.startTime || '');
      setEndDate(initialItem.endDate || '');
      setEndTime(initialItem.endTime || '');
      setFormats(initialItem.formats && initialItem.formats.length ? initialItem.formats : ['weeks', 'days']);
      setNotes(initialItem.notes || '');
      setStickyColor(initialItem.stickyColor || 'yellow');

      if (initialItem.category) {
        const parsedCats = initialItem.category
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);
        setBoxedCategories(parsedCats);
      } else {
        setBoxedCategories([]);
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setStartDate(today);
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setFormats(['weeks', 'days']);
      setNotes('');
      setStickyColor('yellow');
      setBoxedCategories([]);
    }
    setInputValue('');
  }, [initialItem, isOpen]);

  // Compute active input trimmed
  const activeInputTrimmed = inputValue.trimStart();

  // Find matching existing category for autofill ghost text
  const suggestion = useMemo(() => {
    if (!activeInputTrimmed || !existingCategories) return '';
    const lowerInput = activeInputTrimmed.toLowerCase();
    const match = existingCategories.find((cat) => {
      const trimmedCat = cat.trim();
      if (!trimmedCat) return false;
      if (boxedCategories.some((b) => b.toLowerCase() === trimmedCat.toLowerCase())) {
        return false;
      }
      return trimmedCat.toLowerCase().startsWith(lowerInput);
    });
    return match ? match.trim() : '';
  }, [activeInputTrimmed, existingCategories, boxedCategories]);

  // Lighter text tail for ghost autofill right after user's typed text
  const ghostText = useMemo(() => {
    if (!suggestion || !activeInputTrimmed) return '';
    if (suggestion.toLowerCase().startsWith(activeInputTrimmed.toLowerCase())) {
      return suggestion.slice(activeInputTrimmed.length);
    }
    return '';
  }, [suggestion, activeInputTrimmed]);

  // Dropdown list of matching existing categories
  const matchingCategoriesList = useMemo(() => {
    if (!activeInputTrimmed || !existingCategories) return [];
    const lowerInput = activeInputTrimmed.toLowerCase();
    return existingCategories
      .map((c) => c.trim())
      .filter((cat) => {
        if (!cat) return false;
        if (boxedCategories.some((b) => b.toLowerCase() === cat.toLowerCase())) return false;
        return cat.toLowerCase().includes(lowerInput);
      })
      .slice(0, 5);
  }, [activeInputTrimmed, existingCategories, boxedCategories]);

  if (!isOpen) return null;

  const addBoxedCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    setBoxedCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [...prev, trimmed];
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          setInputValue(part);
        } else {
          let textToAdd = part.trim();
          if (suggestion && textToAdd && suggestion.toLowerCase().startsWith(textToAdd.toLowerCase())) {
            textToAdd = suggestion;
          }
          if (textToAdd) {
            addBoxedCategory(textToAdd);
          }
        }
      });
    } else {
      setInputValue(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Comma key pressed: box category
    if (e.key === ',') {
      e.preventDefault();
      let textToBox = inputValue.trim();
      if (suggestion && textToBox && suggestion.toLowerCase().startsWith(textToBox.toLowerCase())) {
        textToBox = suggestion;
      }
      if (textToBox) {
        addBoxedCategory(textToBox);
        setInputValue('');
      }
      return;
    }

    // Backspace key pressed: if current input is empty, delete last box
    if (e.key === 'Backspace') {
      if (inputValue === '' && boxedCategories.length > 0) {
        e.preventDefault();
        setBoxedCategories((prev) => prev.slice(0, -1));
      }
      return;
    }

    // Tab or Right Arrow: accept autofill suggestion
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (ghostText && suggestion) {
        e.preventDefault();
        setInputValue(suggestion);
      }
      return;
    }

    // Enter key: box category without submitting entire form
    if (e.key === 'Enter') {
      e.preventDefault();
      let textToBox = inputValue.trim();
      if (suggestion && textToBox && suggestion.toLowerCase().startsWith(textToBox.toLowerCase())) {
        textToBox = suggestion;
      }
      if (textToBox) {
        addBoxedCategory(textToBox);
        setInputValue('');
      }
      return;
    }
  };

  const handleToggleFormat = (format: FormatUnit) => {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    let allCats = [...boxedCategories];
    let remainingText = inputValue.trim();
    if (suggestion && remainingText && suggestion.toLowerCase().startsWith(remainingText.toLowerCase())) {
      remainingText = suggestion;
    }
    if (remainingText && !allCats.some((c) => c.toLowerCase() === remainingText.toLowerCase())) {
      allCats.push(remainingText);
    }

    const categoryString = allCats.join(', ');

    onSave({
      ...(initialItem?.id ? { id: initialItem.id } : {}),
      title: title.trim(),
      startDate,
      startTime: startTime || undefined,
      endDate: endDate || undefined,
      endTime: endTime || undefined,
      formats: formats.length > 0 ? formats : ['weeks', 'days'],
      notes: notes.trim() || undefined,
      category: categoryString || undefined,
      stickyColor,
      pinned: initialItem?.pinned || false,
    });

    onClose();
  };

  const activeColorConfig =
    STICKY_COLORS.find((c) => c.id === stickyColor) || STICKY_COLORS[0];

  return (
    <div
      className="absolute inset-0 z-30 flex justify-center items-start pt-[125px] pb-8 px-4 overflow-y-auto pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="sticky-note w-full max-w-md p-6 shadow-2xl relative transform rotate-1 font-sans border-t-8 border-yellow-300 rounded-xs pointer-events-auto mt-2 mb-12"
        style={{
          backgroundColor: activeColorConfig.bg,
          color: activeColorConfig.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tape decoration stuck on top (aligned to 3rd space categories row from top of notebook) */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-36 h-7 bg-white/75 shadow-xs border border-amber-200/70 backdrop-blur-xs transform -rotate-1 pointer-events-none z-20 flex items-center justify-center">
          <div className="w-full h-full bg-amber-100/30 opacity-60 border-x-2 border-dashed border-amber-300/50" />
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold flex items-center justify-between border-b border-black/10 pb-2 font-mono">
            <span>{initialItem ? 'Edit Countdown' : 'New Countdown'}</span>
            <div className="flex gap-2 items-center">
              {STICKY_COLORS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setStickyColor(col.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                    stickyColor === col.id
                      ? 'border-black scale-110 shadow-sm'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: col.bg }}
                  title={`${col.id} sticky note`}
                />
              ))}
            </div>
          </h2>
        </div>

        <form id="form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              required
              className="w-full bg-white/70 border-b-2 border-black/20 text-lg font-black text-yellow-900 focus:outline-none focus:border-black p-2 rounded-xs"
            />
          </div>

          {/* Categories custom multi-box tag input */}
          <div>
            <label className="text-[9px] uppercase font-bold text-yellow-900 tracking-wider block mb-1">
              CATEGORIES
            </label>
            <div
              onClick={() => categoryInputRef.current?.focus()}
              className="w-full min-h-[42px] bg-white/70 border border-black/20 focus-within:border-black p-1.5 rounded-xs flex flex-wrap items-center gap-1.5 cursor-text font-mono transition-colors relative"
            >
              {/* Boxed category tags */}
              {boxedCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-amber-200/90 hover:bg-amber-300/90 text-yellow-950 text-xs px-2 py-0.5 rounded-xs border border-yellow-500/60 font-bold font-mono shadow-2xs group transition-all"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBoxedCategories((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="text-yellow-800 hover:text-black font-bold text-xs ml-0.5 cursor-pointer leading-none"
                    title="Delete category box"
                  >
                    ×
                  </button>
                </span>
              ))}

              {/* Active input box being created */}
              <div
                className={`relative inline-flex items-center px-2 py-0.5 rounded-xs font-mono text-xs transition-all ${
                  inputValue.trim()
                    ? 'bg-white border border-yellow-600/80 shadow-2xs ring-1 ring-yellow-400/50'
                    : 'bg-transparent'
                }`}
              >
                <div className="relative inline-flex items-center font-mono text-xs max-w-full">
                  <input
                    ref={categoryInputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    placeholder={boxedCategories.length === 0 ? 'School, Family, Holiday, Birthday...' : ''}
                    className="bg-transparent border-none outline-none text-xs font-mono font-bold text-yellow-950 p-0 focus:ring-0 placeholder:text-yellow-900/40 max-w-full"
                    style={{
                      width: inputValue
                        ? `${Math.max(inputValue.length, 1)}ch`
                        : boxedCategories.length === 0
                        ? '38ch'
                        : '80px',
                    }}
                  />
                  {/* Lighter text inline autofill */}
                  {ghostText && (
                    <span
                      onClick={() => categoryInputRef.current?.focus()}
                      className="text-yellow-900/40 font-mono text-xs font-bold select-none cursor-text -ml-[0.5px]"
                    >
                      {ghostText}
                    </span>
                  )}
                </div>
              </div>

              {/* Dropdown list of existing categories matching input */}
              {isInputFocused && matchingCategoriesList.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-amber-50 border border-yellow-400/80 rounded-xs shadow-md z-30 max-h-36 overflow-y-auto font-mono text-xs py-1">
                  <div className="px-2 py-0.5 text-[9px] uppercase font-bold text-yellow-900/60 border-b border-yellow-200">
                    Existing Categories
                  </div>
                  {matchingCategoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addBoxedCategory(cat);
                        setInputValue('');
                      }}
                      className="w-full text-left px-2 py-1.5 hover:bg-yellow-200/70 text-yellow-950 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] text-yellow-800/60 font-normal">Click or type comma</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* START Date & Time inputs (Time optional) */}
          <div>
            <label className="text-[9px] uppercase font-bold text-yellow-900 tracking-wider block mb-1">
              START DATE & TIME
            </label>
            <div className="input-group flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="flex-1 p-2 bg-white/70 border border-black/20 rounded-xs text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                type="time"
                value={startTime}
                onFocus={() => {
                  if (!startTime) setStartTime('12:00');
                }}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-28 p-2 bg-white/70 border border-black/20 rounded-xs text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* END Date & Time inputs */}
          <div>
            <label className="text-[9px] uppercase font-bold text-yellow-900 tracking-wider block mb-1">
              END DATE & TIME
            </label>
            <div className="input-group flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 p-2 bg-white/70 border border-black/20 rounded-xs text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                type="time"
                value={endTime}
                onFocus={() => {
                  if (!endTime) setEndTime('12:00');
                }}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-28 p-2 bg-white/70 border border-black/20 rounded-xs text-xs font-mono focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          {/* Checkbox-based format selector */}
          <div>
            <label className="text-[9px] uppercase font-bold text-yellow-900 tracking-wider block mb-1">
              DISPLAY UNITS
            </label>
            <div className="checkbox-group grid grid-cols-3 gap-y-2 gap-x-1 bg-white/40 p-2.5 border border-black/15 rounded-xs text-[10px] font-bold">
              {ALL_FORMATS.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-1.5 cursor-pointer select-none text-yellow-900 uppercase"
                >
                  <input
                    type="checkbox"
                    value={f.id}
                    checked={formats.includes(f.id)}
                    onChange={() => handleToggleFormat(f.id)}
                    className="accent-yellow-700 rounded-xs"
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
              rows={2}
              className="w-full p-2 bg-white/70 border border-black/20 rounded-xs focus:outline-none focus:ring-1 focus:ring-black text-xs font-sans resize-none"
            />
          </div>

          {/* Buttons: Cancel & Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 bg-transparent hover:bg-black/10 text-yellow-950 font-bold py-3 uppercase tracking-wider text-xs transition-colors border border-black/20 rounded-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 uppercase tracking-widest text-xs transition-colors shadow-sm rounded-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> {initialItem ? 'Save' : 'Stick'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
