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
 * Hex fallbacks for HA's stock color-picker names, used when the active
 * theme doesn't define a `--{name}-color` CSS variable for that name.
 * Matches the Material Design 500 shades HA ships by default.
 */
const HA_NAMED_COLOR_HEX: Record<string, string> = {
  red: '#f44336',
  pink: '#e91e63',
  purple: '#9c27b0',
  'deep-purple': '#673ab7',
  indigo: '#3f51b5',
  blue: '#2196f3',
  'light-blue': '#03a9f4',
  cyan: '#00bcd4',
  teal: '#009688',
  green: '#4caf50',
  'light-green': '#8bc34a',
  lime: '#cddc39',
  yellow: '#ffeb3b',
  amber: '#ffc107',
  orange: '#ff9800',
  'deep-orange': '#ff5722',
  brown: '#795548',
  grey: '#9e9e9e',
  gray: '#9e9e9e',
  'blue-grey': '#607d8b',
  'blue-gray': '#607d8b',
  black: '#000000',
  white: '#ffffff',
  disabled: '#bdbdbd',
};

/** Hex fallbacks for `primary`/`accent` when the active theme doesn't define them. */
const HA_THEME_COLOR_FALLBACK: Record<string, string> = {
  primary: '#03a9f4',
  accent: '#ff9800',
};

/**
 * Resolve a Home Assistant calendar color (from the entity registry's
 * `options.calendar.color`) to a hex string.
 *
 * - Hex values pass through as-is.
 * - Every other name (including `primary`/`accent` and all of HA's stock
 *   color-picker names — red, indigo, light-blue, etc.) is first looked up
 *   as the theme's `--{name}-color` CSS variable, so calendars stay
 *   consistent with however the active theme groups/recolors those names
 *   (e.g. the Daylight theme maps indigo/blue/light-blue to the same sky
 *   blue). If the theme doesn't define that variable, falls back to HA's
 *   stock Material color for that name.
 */
export function resolveHaColor(raw: string): string {
  if (raw.startsWith('#')) return raw;

  const key = raw.replace(/_/g, '-');
  const themed = getComputedStyle(document.documentElement).getPropertyValue(`--${key}-color`).trim();
  if (themed) return themed;

  return HA_THEME_COLOR_FALLBACK[key] ?? HA_NAMED_COLOR_HEX[key] ?? DEFAULT_PALETTE[0];
}

/**
 * Resolve a calendar entity's display color.
 *
 * - `'daylight'` palette (default): always use Daylight-inspired colors
 * - `'ha'` palette: use the calendar's color set in HA (via `haColors`,
 *   resolved from the entity registry), falling back to the Daylight palette
 *   for calendars that haven't had a color assigned
 */
export function getCalendarColor(
  entityId: string,
  index: number,
  palette: 'daylight' | 'ha' = 'daylight',
  haColors?: Record<string, string>,
): string {
  if (palette === 'ha') {
    const resolved = haColors?.[entityId];
    if (resolved) return resolved;
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
 * Slightly higher opacity for stripe bands — makes adjacent colors
 * more distinguishable while keeping the pastel look.
 */
function stripeBandBackground(color: string): string {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, 0.38)`;
}

/**
 * CSS for a diagonal stripe background (shared events across 2+ calendars).
 * Wide bands (~36px each) to match Skylight 2.0's multi-calendar look.
 */
export function stripeBackground(colors: string[]): string {
  if (colors.length < 2) return pastelBackground(colors[0]);
  const bandWidth = 36; // px per color band
  const stops = colors
    .map((c, i) => {
      const band = stripeBandBackground(c);
      const start = i * bandWidth;
      const end = (i + 1) * bandWidth;
      return `${band} ${start}px, ${band} ${end}px`;
    })
    .join(', ');
  return `repeating-linear-gradient(135deg, ${stops})`;
}
