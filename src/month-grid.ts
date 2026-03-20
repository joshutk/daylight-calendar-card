import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { monthGridStyles } from './styles/month-grid.styles';
import type { ProcessedEvent } from './types';
import { pastelBackground } from './colors';
import { isToday } from './utils';

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MAX_VISIBLE_CHIPS = 3;

interface DayCell {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: ProcessedEvent[];
}

/**
 * Month-grid renderer for the Month view.
 *
 * Standard 7-column calendar grid with leading/trailing days from
 * adjacent months. Each cell shows up to 3 event chips with a
 * "+N more" overflow indicator.
 */
@customElement('daylight-month-grid')
export class DaylightMonthGrid extends LitElement {
  static styles = monthGridStyles;

  @property({ attribute: false }) events: ProcessedEvent[] = [];
  @property({ attribute: false }) referenceDate: Date = new Date();

  // --- helpers ---

  /** Build the full grid of day cells (5 or 6 weeks). */
  private _buildGrid(): DayCell[] {
    const ref = this.referenceDate;
    const year = ref.getFullYear();
    const month = ref.getMonth();

    // First day of the month
    const firstOfMonth = new Date(year, month, 1);
    // Day of week the month starts on (0 = Sunday)
    const startDow = firstOfMonth.getDay();

    // Last day of the month
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();

    // Calculate total cells needed: leading days + month days, rounded up to full weeks
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

    const cells: DayCell[] = [];

    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, 1 - startDow + i);
      const isCurrentMonth = date.getMonth() === month;

      cells.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday: isToday(date),
        events: this._eventsForDay(date),
      });
    }

    return cells;
  }

  /** Get events that overlap a given calendar day. */
  private _eventsForDay(day: Date): ProcessedEvent[] {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return this.events
      .filter(ev => ev.start < dayEnd && ev.end > dayStart)
      .sort((a, b) => {
        // All-day events first, then by start time
        if (a.isAllDay !== b.isAllDay) return a.isAllDay ? -1 : 1;
        return a.start.getTime() - b.start.getTime();
      });
  }

  private _onChipClick(ev: ProcessedEvent): void {
    this.dispatchEvent(
      new CustomEvent('tile-click', {
        bubbles: true,
        composed: true,
        detail: ev,
      }),
    );
  }

  private _onMoreClick(cell: DayCell): void {
    this.dispatchEvent(
      new CustomEvent('more-click', {
        bubbles: true,
        composed: true,
        detail: { date: cell.date, events: cell.events },
      }),
    );
  }

  // --- rendering ---

  private _renderChip(ev: ProcessedEvent) {
    const bg = pastelBackground(ev.color);
    return html`
      <div
        class="event-chip"
        style="background: ${bg}; --chip-color: ${ev.color};"
        @click=${(e: Event) => {
          e.stopPropagation();
          this._onChipClick(ev);
        }}
        title="${ev.summary}"
      >
        ${ev.summary}
      </div>
    `;
  }

  private _renderDayCell(cell: DayCell) {
    const classes = [
      'day-cell',
      cell.isCurrentMonth ? '' : 'outside',
      cell.isToday ? 'today' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const visible = cell.events.slice(0, MAX_VISIBLE_CHIPS);
    const overflow = cell.events.length - MAX_VISIBLE_CHIPS;

    return html`
      <div class="${classes}">
        <span class="day-number">${cell.dayNumber}</span>
        <div class="event-chips">
          ${repeat(visible, ev => ev.id, ev => this._renderChip(ev))}
          ${overflow > 0
            ? html`
                <span
                  class="more-chip"
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._onMoreClick(cell);
                  }}
                >
                  +${overflow} more
                </span>
              `
            : ''}
        </div>
      </div>
    `;
  }

  protected render() {
    const cells = this._buildGrid();

    return html`
      <div class="month-grid">
        ${DOW_LABELS.map(label => html`<div class="dow-header">${label}</div>`)}
        ${repeat(cells, cell => `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`, cell => this._renderDayCell(cell))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-month-grid': DaylightMonthGrid;
  }
}
