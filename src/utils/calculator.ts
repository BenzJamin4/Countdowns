import { CountdownItem, FormatUnit } from '../types';

export interface CalculationResult {
  formattedText: string;
  isCompleted: boolean;
  isCountUp: boolean;
  progressPercent?: number; // If start & end are provided, progress %
  totalMs: number;
}

export function parseItemDate(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date();
  const time = timeStr && timeStr.trim() ? timeStr : '00:00';
  return new Date(`${dateStr}T${time}:00`);
}

export function calculateCountdown(item: CountdownItem, now: Date = new Date()): CalculationResult {
  const start = parseItemDate(item.startDate, item.startTime);
  const end = item.endDate ? parseItemDate(item.endDate, item.endTime) : null;

  let targetDate: Date;
  let isCountUp = false;

  if (end) {
    targetDate = end;
  } else {
    // If no end date, if start is in past, count up from start. If start is in future, count down to start.
    if (now > start) {
      targetDate = start;
      isCountUp = true;
    } else {
      targetDate = start;
    }
  }

  let diff = isCountUp ? now.getTime() - targetDate.getTime() : targetDate.getTime() - now.getTime();
  const isCompleted = !isCountUp && diff <= 0;

  if (isCompleted) {
    return {
      formattedText: '✨ Completed!',
      isCompleted: true,
      isCountUp: false,
      progressPercent: 100,
      totalMs: 0,
    };
  }

  // Calculate progress percentage if both start and end exist
  let progressPercent: number | undefined;
  if (start && end) {
    const totalDuration = end.getTime() - start.getTime();
    if (totalDuration > 0) {
      const elapsed = now.getTime() - start.getTime();
      progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    }
  }

  let ms = Math.abs(diff);

  // Unit conversion breakdown in milliseconds
  const unitMs: Record<FormatUnit, number> = {
    years: 31536000000,
    months: 2628000000,
    weeks: 604800000,
    days: 86400000,
    hours: 3600000,
    minutes: 60000,
  };

  const selectedFormats = item.formats && item.formats.length > 0
    ? item.formats
    : ['weeks', 'days'];

  // Order formats from largest to smallest
  const orderedUnits: FormatUnit[] = ['years', 'months', 'weeks', 'days', 'hours', 'minutes'];
  const activeFormats = orderedUnits.filter((u) => selectedFormats.includes(u));

  const parts: string[] = [];
  let remaining = ms;

  // If only 1 unit selected (e.g. only "days"), show total count of that unit
  if (activeFormats.length === 1) {
    const unit = activeFormats[0];
    const count = Math.floor(remaining / unitMs[unit]);
    const label = unit[0]; // 'y', 'm', 'w', 'd', 'h', 'm', 's'
    parts.push(`${count}${unit === 'months' ? 'mo' : label}`);
  } else {
    for (const unit of activeFormats) {
      const count = Math.floor(remaining / unitMs[unit]);
      if (count > 0 || parts.length > 0 || unit === activeFormats[activeFormats.length - 1]) {
        remaining %= unitMs[unit];
        const suffix = unit === 'months' ? 'mo' : unit === 'minutes' ? 'm' : unit[0];
        parts.push(`${count}${suffix}`);
      }
    }
  }

  const resultText = parts.length > 0 ? parts.join(' ') : '0s';
  const prefix = isCountUp ? '+ ' : '';

  return {
    formattedText: `${prefix}${resultText}`,
    isCompleted: false,
    isCountUp,
    progressPercent,
    totalMs: diff,
  };
}

export function formatSingleDate(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [yyyy, mm, dd] = parts;
  const yearShort = yyyy.slice(-2);
  const monthNum = parseInt(mm, 10);
  const dayNum = parseInt(dd, 10);
  const dateFormatted = `${monthNum}/${dayNum}/${yearShort}`;

  if (!timeStr || !timeStr.trim()) return dateFormatted;

  const timeParts = timeStr.split(':');
  if (timeParts.length < 2) return `${dateFormatted} ${timeStr}`;
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeFormatted = `${hours}:${minutes} ${ampm}`;

  return `${dateFormatted} ${timeFormatted}`;
}

export function formatDateTimeDisplay(startDate: string, startTime?: string, endDate?: string, endTime?: string): string {
  const startPart = formatSingleDate(startDate, startTime);
  if (!endDate) {
    return startPart;
  }
  const endPart = formatSingleDate(endDate, endTime);
  return `${startPart} → ${endPart}`;
}
