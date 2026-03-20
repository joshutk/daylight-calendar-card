import { type HomeAssistant } from './ha-types';

export type { HomeAssistant };

export type ViewType = 'agenda' | 'multiday' | 'month';

export interface DaylightCardConfig {
  type: string;
  entities: string[];
  default_view?: ViewType;
  enabled_views?: ViewType[];
  // Agenda
  agenda_days?: number;
  // Multi-day
  multi_day_count?: number;
  // Time grid
  grid_height?: number;
  pixels_per_hour?: number;
  hour_start?: number;
  hour_end?: number;
  // Event layout
  max_columns?: number;
  gap_threshold_minutes?: number;
  buffer_minutes?: number;
  // Appearance
  color_palette?: 'daylight' | 'ha';
  // UI toggles
  show_legend?: boolean;
  show_current_time?: boolean;
  show_all_day?: boolean;
  // Sizing
  font_scale?: number; // multiplier, default 1.0
  // Person mapping: calendar entity → person entity for avatars
  calendar_persons?: Record<string, string>;
}

export interface CalendarAvatar {
  initial: string;       // first letter of calendar name
  color: string;         // calendar color
  pictureUrl?: string;   // HA person entity picture, if mapped
}

export interface CalendarEventDateTime {
  dateTime?: string;
  date?: string;
}

export interface CalendarEvent {
  summary: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  description?: string;
  location?: string;
  uid?: string;
  recurrence_id?: string;
}

export interface ProcessedEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  uid?: string;
  isAllDay: boolean;
  calendarEntity: string;
  calendarName: string;
  color: string;
  avatar: CalendarAvatar;
  // Layout properties (set by EventProcessor)
  column?: number;
  totalColumns?: number;
  // Shared event (same UID across calendars)
  sharedWith?: string[]; // other calendar entity IDs
  sharedColors?: string[]; // colors for stripe rendering
  sharedCalendarNames?: string[]; // friendly names for all participating calendars
  sharedAvatars?: CalendarAvatar[]; // avatars for all participating calendars
}

