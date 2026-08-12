import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CountdownItem as CountdownItemType, PaperThemeConfig } from '../types';
import { calculateCountdown, formatDateTimeDisplay } from '../utils/calculator';
import { Sparkles, Pin, Check } from 'lucide-react';

interface Props {
  item: CountdownItemType;
  theme: PaperThemeConfig;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onTogglePin: (id: number) => void;
  onDuplicate: (item: CountdownItemType) => void;
  useEmojiButtons?: boolean;
}

export const CountdownItem: React.FC<Props> = ({
  item,
  theme,
  onEdit,
  onDelete,
  onTogglePin,
  onDuplicate,
  useEmojiButtons = true,
}) => {
  const [calculation, setCalculation] = useState(() => calculateCountdown(item));

  useEffect(() => {
    // Initial calculate
    const update = () => {
      const res = calculateCountdown(item);
      setCalculation((prev) => {
        // Trigger confetti once when completing
        if (!prev.isCompleted && res.isCompleted) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return res;
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const dateDisplay = formatDateTimeDisplay(
    item.startDate,
    item.startTime,
    item.endDate,
    item.endTime
  );

  const badgeLabel = item.category ? item.category : null;

  return (
    <div
      className="item-container relative group transition-all duration-200 mb-0"
    >
      {/* Translucent baby blue top line stretching from left paper edge to right paper edge */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-sky-400/50 pointer-events-none z-10" />

      {/* Brass encircled hole punch on the notebook left margin */}
      <div
        className="absolute left-[20px] top-[10px] w-5 h-5 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-800 p-[2.5px] shadow-xs z-10 flex items-center justify-center pointer-events-none"
        title="Brass Encircled Hole Punch"
      >
        <div className="w-full h-full rounded-full bg-[#000000] shadow-inner border border-amber-950/60" />
      </div>

      {/* Row 1: Title, Categories & Actions */}
      <div
        className="countdown-row flex flex-wrap justify-between items-center pl-[4.5rem] pr-[1.5rem] min-h-[40px] py-1 gap-x-2 gap-y-1 border-b"
        style={{
          color: theme.textColor,
          borderColor: theme.lineColor,
        }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
          {item.pinned && <span className="text-base shrink-0" title="Pinned Countdown">📌</span>}
          <strong className="text-base sm:text-lg font-bold tracking-tight uppercase flex items-center gap-2 break-words">
            {item.title}
          </strong>

          {item.category && (
            <div className="flex flex-wrap items-center gap-1 shrink-0">
              {item.category
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean)
                .map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-xs border border-black/10 font-sans leading-none text-slate-700 bg-amber-100 shrink-0"
                  >
                    {cat}
                  </span>
                ))}
            </div>
          )}

          {calculation.isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 font-bold animate-pulse font-mono shrink-0">
              <Sparkles className="w-3 h-3 inline" /> Done
            </span>
          )}
        </div>

        {/* Action buttons with emoji support */}
        <div className="flex items-center gap-1 shrink-0 bg-white/60 backdrop-blur-xs px-1 rounded-md h-[28px] my-auto">
          <button
            type="button"
            onClick={() => onTogglePin(item.id)}
            className={`btn p-1 text-sm hover:scale-110 transition-transform cursor-pointer ${
              item.pinned ? 'opacity-100 font-bold' : 'opacity-80 hover:opacity-100'
            }`}
            title={item.pinned ? 'Unpin countdown' : 'Pin to top'}
          >
            {useEmojiButtons ? '📌' : <Pin className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onDuplicate(item)}
            className="btn p-1 text-sm hover:scale-110 transition-transform opacity-80 hover:opacity-100 cursor-pointer"
            title="Duplicate countdown"
          >
            {useEmojiButtons ? '📄' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={() => onEdit(item.id)}
            className="btn p-1 text-sm hover:scale-110 transition-transform opacity-90 hover:opacity-100 cursor-pointer"
            title="Edit countdown"
          >
            {useEmojiButtons ? '✏️' : 'Edit'}
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="btn p-1 text-sm hover:scale-110 transition-transform text-red-600 opacity-90 hover:opacity-100 cursor-pointer"
            title="Delete countdown"
          >
            {useEmojiButtons ? '🗑️' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Row 2: Dates Row (between Title row and Actual Countdown row) + % Done Bar on the right */}
      <div
        className="countdown-row flex flex-wrap justify-between items-center pl-[4.5rem] pr-[1.5rem] min-h-[40px] py-1 gap-2 border-b"
        style={{
          color: theme.subtextColor,
          borderColor: theme.lineColor,
        }}
      >
        {/* Date Range text on paper (no grey box) */}
        <span className="text-xs sm:text-sm font-bold font-mono opacity-85">
          {dateDisplay}
        </span>

        {/* % Done Bar on the right of the dates row */}
        {calculation.progressPercent !== undefined && (
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <span className="text-[10px] font-mono opacity-75 uppercase font-bold hidden sm:inline">Progress:</span>
            <div className="w-20 sm:w-28 h-2 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-700 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, calculation.progressPercent))}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold">
              {Math.round(calculation.progressPercent)}%
            </span>
          </div>
        )}
      </div>

      {/* Row 3: Actual Countdown Row (Live Timer) */}
      <div
        className="countdown-row flex justify-between items-center pl-[4.5rem] pr-[1.5rem] min-h-[40px] py-1 border-b"
        style={{
          color: theme.textColor,
          borderColor: theme.lineColor,
        }}
      >
        <div className="flex items-center gap-2 font-bold font-mono">
          <span
            id={`timer-${item.id}`}
            className={`text-base sm:text-lg font-medium tracking-tight font-mono ${
              calculation.isCompleted
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-[#475569]'
            }`}
          >
            {calculation.formattedText}
          </span>
        </div>
      </div>

      {/* Optional Row 4: Notes */}
      {item.notes && (
        <div
          className="countdown-row flex items-center pl-[4.5rem] pr-[1.5rem] min-h-[40px] py-1 italic text-slate-500 text-xs sm:text-sm truncate border-b"
          style={{
            borderColor: theme.lineColor,
          }}
        >
          <span className="truncate">{item.notes}</span>
        </div>
      )}
    </div>
  );
};
