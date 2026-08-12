export type FormatUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes';

export type Category = 'event' | 'work' | 'personal' | 'goal' | 'holiday' | 'custom';

export type PaperStyle = 'classic' | 'yellow_pad' | 'blueprint' | 'vintage';

export interface CountdownItem {
  id: number;
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  formats: FormatUnit[];
  notes?: string;
  category?: string;
  pinned?: boolean;
  stickyColor?: 'yellow' | 'pink' | 'green' | 'blue';
  createdAt?: number;
}

export interface PaperThemeConfig {
  id: PaperStyle;
  name: string;
  paperBg: string;
  lineColor: string;
  marginColor: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
  fontFamily: string;
  lineHeight: string;
}
