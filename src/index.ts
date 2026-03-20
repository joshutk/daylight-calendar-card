import './card';

// Card registration info for HA UI
interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview: boolean;
}

const w = window as unknown as { customCards?: CustomCardEntry[] };
w.customCards = w.customCards || [];
w.customCards.push({
  type: 'daylight-calendar-card',
  name: 'Daylight Calendar',
  description: 'A clean, family-friendly calendar card with Agenda/Multi-Day/Month views',
  preview: true,
});

console.info(
  '%c DAYLIGHT CALENDAR %c v0.1.0 ',
  'color: white; background: #7BAFD4; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #7BAFD4; background: #eee; padding: 2px 6px; border-radius: 0 4px 4px 0;',
);
