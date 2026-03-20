import type { HomeAssistant } from './types';

// Daylight-inspired default palette
const DEFAULT_PALETTE = [
  '#E8858A', // coral pink
  '#8CB89C', // sage green
  '#7BAFD4', // sky blue
  '#A78BCA', // lavender
  '#E8A87C', // peach
  '#7CC5B8', // mint
];

/** Daylight accent color (coral pink) — used for today badge, now indicator, etc. */
export const DAYLIGHT_ACCENT = '#E8858A';

/**
 * Resolve a calendar entity's display color.
 *
 * - `'daylight'` palette (default): always use Daylight-inspired colors, ignoring HA entity color
 * - `'ha'` palette: prefer the HA entity's `color` attribute, fall back to Daylight palette
 */
export function getCalendarColor(
  hass: HomeAssistant,
  entityId: string,
  index: number,
  palette: 'daylight' | 'ha' = 'daylight',
): string {
  if (palette === 'ha') {
    const entity = hass.states[entityId];
    const attrColor = entity?.attributes?.color as string | undefined;
    if (attrColor) return attrColor;
  }
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length];
}

/**
 * Parse a hex color string to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    return { r: 128, g: 128, b: 128 }; // safe gray fallback
  }
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Return an rgba background CSS value for an event tile.
 * Uses ~30% opacity so it adapts to both light and dark themes.
 */
export function pastelBackground(color: string): string {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

/**
 * CSS for a diagonal stripe background (shared events across 2+ calendars).
 */
export function stripeBackground(colors: string[]): string {
  if (colors.length < 2) return pastelBackground(colors[0]);
  const stripeWidth = 8;
  const stops = colors
    .map((c, i) => {
      const pastel = pastelBackground(c);
      const start = (i / colors.length) * stripeWidth;
      const end = ((i + 1) / colors.length) * stripeWidth;
      return `${pastel} ${start}px, ${pastel} ${end}px`;
    })
    .join(', ');
  return `repeating-linear-gradient(45deg, ${stops})`;
}
