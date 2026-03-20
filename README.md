# Daylight Calendar Card

A clean, modern calendar card for [Home Assistant](https://www.home-assistant.io/) with three flexible views and a visual config editor.

<!-- Replace with a hero screenshot or gif showing the card in action -->
![Daylight Calendar Card](https://via.placeholder.com/800x450?text=Hero+Screenshot+Here)

[![GitHub Release](https://img.shields.io/github/v/release/joshutk/daylight-calendar-card?style=flat-square)](https://github.com/joshutk/daylight-calendar-card/releases)
[![HACS](https://img.shields.io/badge/HACS-Custom-blue?style=flat-square)](https://github.com/hacs/integration)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## Features

### Three Views

Switch between views with the in-card toggle, or set a default in config.

**Agenda** — A clean chronological list with smart day labels ("Today", "Tomorrow") and configurable range (1–30 days).

<!-- Screenshot: Agenda view -->
![Agenda View](https://via.placeholder.com/400x300?text=Agenda+View)

**Multi-Day** — Time grid with side-by-side day columns, all-day event banners, and a current-time indicator. Configurable from 1 to 7 days.

<!-- Screenshot: Multi-Day view -->
![Multi-Day View](https://via.placeholder.com/400x300?text=Multi-Day+View)

**Month** — Traditional calendar grid with event chips and "+N more" overflow.

<!-- Screenshot: Month view -->
![Month View](https://via.placeholder.com/400x300?text=Month+View)

### Visual Config Editor

Full visual editor — no YAML required. Configure calendars, views, colors, and advanced time grid settings all from the UI.

<!-- Screenshot: Visual config editor -->
![Config Editor](https://via.placeholder.com/400x300?text=Config+Editor)

### Color Palettes

Choose between two palettes:

| Palette | Description |
|---------|-------------|
| **Daylight** (default) | A curated set of soft, readable colors — coral, sage, sky blue, lavender, peach, mint |
| **Home Assistant** | Uses your calendar entity colors and the HA theme's `--primary-color` |

<!-- Screenshot: Side-by-side comparison of Daylight vs HA palette -->
![Color Palettes](https://via.placeholder.com/600x250?text=Daylight+vs+HA+Palette)

### Calendar Legend

Interactive legend lets you show/hide individual calendars with a click. Events animate smoothly in and out.

<!-- Gif: Toggling calendars on and off -->
![Calendar Toggle](https://via.placeholder.com/400x250?text=Calendar+Toggle+Gif)

### Shared Event Detection

Events that appear on multiple calendars (same UID) are automatically detected and rendered with a diagonal stripe pattern showing both calendar colors.

<!-- Screenshot: Shared event with stripe pattern -->
![Shared Events](https://via.placeholder.com/400x200?text=Shared+Event+Stripe)

### Event Detail Popover

Click any event to see full details — date, time, location, description, and which calendar it belongs to.

<!-- Screenshot: Detail popover -->
![Detail Popover](https://via.placeholder.com/300x250?text=Detail+Popover)

### Smooth Animations

Events fade and slide when switching views, toggling calendars, or navigating dates. No jarring layout jumps.

---

## Installation

### HACS (Recommended)

1. Open **HACS** in your Home Assistant instance
2. Go to **Frontend** > click the **three dots** (top right) > **Custom repositories**
3. Add `joshutk/daylight-calendar-card` with type **Dashboard**
4. Click **Download**
5. Restart Home Assistant (or hard-refresh your browser)

### Manual

1. Download `daylight-calendar-card.js` from the [latest release](https://github.com/joshutk/daylight-calendar-card/releases/latest)
2. Copy it to your `/config/www/` directory
3. Add the resource in **Settings > Dashboards > Resources**:
   - URL: `/local/daylight-calendar-card.js`
   - Type: JavaScript Module
4. Hard-refresh your browser

---

## Usage

Add the card to any dashboard:

```yaml
type: custom:daylight-calendar-card
entities:
  - calendar.personal
  - calendar.work
  - calendar.family
```

Or use the visual editor — search for "Daylight Calendar" when adding a card.

### Full Configuration

```yaml
type: custom:daylight-calendar-card

# Required
entities:
  - calendar.personal
  - calendar.work

# Views
default_view: agenda          # agenda | multiday | month
enabled_views:                # which views appear in the toggle
  - agenda
  - multiday
  - month

# Agenda view
agenda_days: 7                # 1–30, default: 7

# Multi-day view
multi_day_count: 5            # 1–7, default: 5

# Color
color_palette: daylight       # daylight | ha

# UI toggles
show_legend: true             # calendar legend bar
show_all_day: true            # all-day events in multi-day view
show_current_time: true       # "now" indicator line

# Advanced (time grid)
grid_height: 500              # max height in px (200–1200)
pixels_per_hour: 60           # vertical density (40–120)
hour_start: 7                 # fixed start hour (0–23), omit for auto
hour_end: 20                  # fixed end hour (1–24), omit for auto
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entities` | list | **required** | Calendar entity IDs |
| `default_view` | string | `agenda` | Starting view: `agenda`, `multiday`, or `month` |
| `enabled_views` | list | all three | Which views to show in the toggle |
| `agenda_days` | number | `7` | Number of days in Agenda view |
| `multi_day_count` | number | `5` | Number of day columns in Multi-Day view |
| `color_palette` | string | `daylight` | `daylight` for curated palette, `ha` for entity/theme colors |
| `show_legend` | boolean | `true` | Show the calendar legend |
| `show_all_day` | boolean | `true` | Show all-day events in Multi-Day headers |
| `show_current_time` | boolean | `true` | Show the current time indicator |
| `grid_height` | number | `500` | Max height of the time grid in pixels |
| `pixels_per_hour` | number | `60` | Vertical pixels per hour in the time grid |
| `hour_start` | number | auto | Fixed start hour for the time grid |
| `hour_end` | number | auto | Fixed end hour for the time grid |

---

## Examples

### Minimal

```yaml
type: custom:daylight-calendar-card
entities:
  - calendar.personal
```

### Family Dashboard

```yaml
type: custom:daylight-calendar-card
entities:
  - calendar.family
  - calendar.josh
  - calendar.kaye
  - calendar.kids
default_view: agenda
agenda_days: 14
color_palette: daylight
```

### Compact Work Week

```yaml
type: custom:daylight-calendar-card
entities:
  - calendar.work
default_view: multiday
multi_day_count: 5
enabled_views:
  - multiday
  - month
grid_height: 400
pixels_per_hour: 50
hour_start: 8
hour_end: 18
show_legend: false
```

---

## Development

### Prerequisites

- Node.js 20+
- Docker (optional, for local HA testing)

### Setup

```bash
git clone https://github.com/joshutk/daylight-calendar-card.git
cd daylight-calendar-card
npm install
```

### Build

```bash
npm run build          # production build
npm run dev            # watch mode + auto-copy to Docker HA
npm run dev:live       # watch mode + SCP to homeassistant.local
npm run lint           # type-check
```

### Local HA Testing

A `docker-compose.yml` is included for a one-command local HA instance:

```bash
docker compose up -d
```

Then add the Local Calendar integration and register `/local/daylight-calendar-card.js` as a resource.

### Releasing

1. Make your changes and push to `master`
2. Tag a version: `git tag v0.2.0 && git push origin v0.2.0`
3. Create a release on GitHub from the tag
4. The CI workflow automatically builds and attaches `daylight-calendar-card.js` to the release
5. HACS picks up the new version automatically

---

## Credits

Built with [Lit](https://lit.dev/) and a lot of coffee.

## License

[MIT](LICENSE)
