import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { timeGridStyles } from './styles/time-grid.styles';
import type { ProcessedEvent } from './types';
import { pastelBackground } from './colors';
import { isToday } from './utils';
import './event-tile';


const DEFAULT_PIXELS_PER_HOUR = 60;

const HOUR_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: undefined,
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Time-grid renderer for Day and Week views.
 *
 * Uses a straight linear time axis so events at the same clock time
 * across different days are always horizontally aligned.
 */
@customElement('daylight-time-grid')
export class DaylightTimeGrid extends LitElement {
  static styles = timeGridStyles;

  @property({ attribute: false }) events: ProcessedEvent[] = [];
  @property({ attribute: false }) allDayEvents: ProcessedEvent[] = [];
  /** All timed events (unfiltered) — used for stable hour range calculation */
  @property({ attribute: false }) allTimedEvents: ProcessedEvent[] = [];
  @property({ type: Number }) dayCount = 5;
  @property({ attribute: false }) referenceDate: Date = new Date();
  @property({ type: Boolean }) showCurrentTime = true;
  @property({ type: Number }) gridHeight = 500;
  @property({ type: Number }) pixelsPerHour = DEFAULT_PIXELS_PER_HOUR;
  @property({ type: Number, attribute: false }) hourStart?: number;
  @property({ type: Number, attribute: false }) hourEnd?: number;

  private _hasScrolled = false;
  private _exitingIds: Set<string> = new Set();
  private _enteringIds: Set<string> = new Set();
  private _renderEvents: ProcessedEvent[] = [];
  private _renderAllDayEvents: ProcessedEvent[] = [];
  private _exitTimer: number | undefined;
  private _enterTimer: number | undefined;

  protected updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('dayCount') || changed.has('referenceDate')) {
      this._hasScrolled = false;
    }
    if (!this._hasScrolled && this.events.length > 0) {
      this._hasScrolled = true;
      this.updateComplete.then(() => this._scrollToNow());
    }

    if (changed.has('events') || changed.has('allDayEvents')) {
      const prevTimed = changed.get('events') as ProcessedEvent[] | undefined;
      const prevAllDay = changed.get('allDayEvents') as ProcessedEvent[] | undefined;
      this._handleEventTransition(prevTimed, prevAllDay);
    }
  }

  private _handleEventTransition(
    prevTimed: ProcessedEvent[] | undefined,
    prevAllDay: ProcessedEvent[] | undefined,
  ): void {
    // Combine timed + all-day for unified tracking
    const allPrev = [...(prevTimed ?? []), ...(prevAllDay ?? [])];
    const allCurrent = [...this.events, ...this.allDayEvents];
    const currentIds = new Set(allCurrent.map(e => e.id));
    const prevIds = new Set(allPrev.map(e => e.id));

    const departed = allPrev.filter(ev => !currentIds.has(ev.id));
    const arrived = allCurrent.filter(ev => !prevIds.has(ev.id));

    // Handle departures: keep ALL events at old positions during fade-out,
    // then switch to new positions so CSS transitions animate the reflow.
    if (departed.length > 0) {
      // Phase 1: render previous events at their old column positions
      this._renderEvents = [...(prevTimed ?? [])];
      this._renderAllDayEvents = [...(prevAllDay ?? [])];
      this.requestUpdate();

      // Phase 2: mark departed for fade-out (still at old positions)
      requestAnimationFrame(() => {
        for (const ev of departed) {
          this._exitingIds.add(ev.id);
        }
        this.requestUpdate();

        if (this._exitTimer) clearTimeout(this._exitTimer);
        // Phase 3: after fade-out, switch to new events with new column layout
        // — CSS transitions on left/width animate remaining events into place
        this._exitTimer = window.setTimeout(() => {
          this._exitingIds.clear();
          this._renderEvents = [...this.events];
          this._renderAllDayEvents = [...this.allDayEvents];
          this.requestUpdate();
        }, 300);
      });
    } else {
      this._renderEvents = [...this.events];
      this._renderAllDayEvents = [...this.allDayEvents];
    }

    // Handle arrivals
    if (arrived.length > 0 && allPrev.length > 0) {
      for (const ev of arrived) {
        this._enteringIds.add(ev.id);
      }
      this.requestUpdate();

      if (this._enterTimer) clearTimeout(this._enterTimer);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._enteringIds.clear();
          this.requestUpdate();
        });
      });
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._exitTimer) clearTimeout(this._exitTimer);
    if (this._enterTimer) clearTimeout(this._enterTimer);
  }

  private _scrollToNow(): void {
    const wrapper = this.renderRoot.querySelector('.grid-wrapper') as HTMLElement | null;
    if (!wrapper) return;

    const days = this._getDays();
    const hasToday = days.some(d => isToday(d));
    const { startHour } = this._getHourRange();

    if (hasToday) {
      // Scroll so current time is near the top with some padding
      const now = new Date();
      const nowPixel = this._timeToPixel(now, startHour);
      wrapper.scrollTop = Math.max(0, nowPixel - 40);
    } else {
      wrapper.scrollTop = 0;
    }
  }

  // --- computed range ---

  /**
   * Find the earliest and latest event hours across ALL days in the view,
   * then add 1-hour padding on each side. This gives a consistent axis
   * for the entire week.
   */
  private _getHourRange(): { startHour: number; endHour: number } {
    // Use config overrides if provided
    if (this.hourStart != null && this.hourEnd != null) {
      return { startHour: this.hourStart, endHour: this.hourEnd };
    }

    // Use unfiltered events for stable range across filter toggles
    const source = this.allTimedEvents.length > 0 ? this.allTimedEvents : this.events;
    const timed = source.filter(e => !e.isAllDay);
    if (timed.length === 0) return { startHour: 8, endHour: 18 };

    let minHour = 23;
    let maxHour = 0;
    for (const ev of timed) {
      const sh = ev.start.getHours();
      const eh = ev.end.getHours() + (ev.end.getMinutes() > 0 ? 1 : 0);
      if (sh < minHour) minHour = sh;
      if (eh > maxHour) maxHour = eh;
    }

    const startHour = this.hourStart ?? Math.max(0, minHour - 1);
    const endHour = this.hourEnd ?? Math.min(24, maxHour + 1);
    return { startHour, endHour };
  }

  /** Convert a clock time (hours + minutes) to a pixel Y position. */
  private _timeToPixel(date: Date, startHour: number): number {
    const hours = date.getHours() + date.getMinutes() / 60;
    return (hours - startHour) * this.pixelsPerHour;
  }

  // --- helpers ---

  private _getDays(): Date[] {
    const ref = new Date(this.referenceDate);
    ref.setHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 0; i < this.dayCount; i++) {
      const d = new Date(ref);
      d.setDate(ref.getDate() + i);
      days.push(d);
    }
    return days;
  }

  private _allDayEventsForDay(day: Date): ProcessedEvent[] {
    const source = this._renderAllDayEvents.length > 0 ? this._renderAllDayEvents : this.allDayEvents;
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    return source.filter(ev => ev.start < dayEnd && ev.end > dayStart);
  }

  private _formatHour(hour: number): string {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d.toLocaleTimeString(undefined, HOUR_FORMAT);
  }

  // --- rendering ---

  private _renderAllDayChips(events: ProcessedEvent[]) {
    return html`
      <div class="header-all-day-events ${events.length === 0 ? 'empty' : ''}">
        ${repeat(events, ev => ev.id, ev => {
          const exiting = this._exitingIds.has(ev.id);
          const entering = this._enteringIds.has(ev.id);
          return html`
            <div
              class="header-all-day-chip ${exiting ? 'exiting' : entering ? 'entering' : ''}"
              style="background: ${pastelBackground(ev.color)};"
              @click=${() => this.dispatchEvent(new CustomEvent('tile-click', {
                bubbles: true,
                composed: true,
                detail: ev,
              }))}
            >
              ${ev.summary}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _renderDayHeader(day: Date) {
    return html`
      <div class="multi-day-header ${isToday(day) ? 'today' : ''}">
        <div class="header-label-row">
          <span class="header-day-name">${DAY_NAMES[day.getDay()]}</span>
          <span class="header-day-number ${isToday(day) ? 'today-badge' : ''}">${day.getDate()}</span>
        </div>
        ${this._renderAllDayChips(this._allDayEventsForDay(day))}
      </div>
    `;
  }

  private _renderMultiDayHeaders(days: Date[]) {
    return html`
      <div class="multi-day-headers">
        <div class="time-axis-spacer"></div>
        ${days.map(d => this._renderDayHeader(d))}
      </div>
    `;
  }

  private _renderTimeAxis(startHour: number, endHour: number, totalHeight: number) {
    const labels: Array<{ label: string; pixel: number }> = [];
    for (let h = startHour; h <= endHour; h++) {
      labels.push({
        label: this._formatHour(h),
        pixel: (h - startHour) * this.pixelsPerHour,
      });
    }

    return html`
      <div class="time-axis" style="height: ${totalHeight}px;">
        ${labels.map(
          ({ label, pixel }) => html`
            <span class="time-label" style="top: ${pixel}px;">${label}</span>
          `,
        )}
      </div>
    `;
  }

  private _renderGridlines(startHour: number, endHour: number) {
    const lines = [];
    for (let h = startHour; h <= endHour; h++) {
      lines.push(html`<div class="gridline" style="top: ${(h - startHour) * this.pixelsPerHour}px;"></div>`);
    }
    return lines;
  }

  private _renderEventTile(ev: ProcessedEvent, startHour: number) {
    const exiting = this._exitingIds.has(ev.id);
    const entering = this._enteringIds.has(ev.id);
    const top = this._timeToPixel(ev.start, startHour);
    const bottom = this._timeToPixel(ev.end, startHour);
    const height = Math.max(bottom - top, 20);

    const col = ev.column ?? 0;
    const totalCols = ev.totalColumns ?? 1;
    // Each event gets equal width based on total columns in the cluster.
    // This naturally handles any number of overlaps — more events = narrower tiles.
    const widthPercent = 100 / Math.max(totalCols, 1);
    const leftPercent = col * widthPercent;

    return html`
      <div
        class="event-positioner ${exiting ? 'exiting' : entering ? 'entering' : ''}"
        style="
          top: ${top}px;
          height: ${height}px;
          left: ${leftPercent}%;
          width: ${widthPercent}%;
        "
      >
        <daylight-event-tile
          .event=${ev}
          ?compact=${height < 40}
        ></daylight-event-tile>
      </div>
    `;
  }

  private _renderNowIndicator(startHour: number, endHour: number) {
    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;
    if (nowHour < startHour || nowHour > endHour) return nothing;

    const top = this._timeToPixel(now, startHour);

    return html`
      <div class="now-indicator" style="top: ${top}px;">
        <div class="now-dot"></div>
        <div class="now-line"></div>
      </div>
    `;
  }

  private _renderEventsForDay(day: Date): ProcessedEvent[] {
    const source = this._renderEvents.length > 0 ? this._renderEvents : this.events;
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    return source.filter(
      ev => !ev.isAllDay && ev.start < dayEnd && ev.end > dayStart,
    );
  }

  private _renderDayColumn(day: Date, startHour: number, endHour: number, totalHeight: number) {
    const dayEvents = this._renderEventsForDay(day);
    const dayIsToday = isToday(day);
    return html`
      <div
        class="day-column ${dayIsToday ? 'today' : ''}"
        style="height: ${totalHeight}px; position: relative;"
      >
        ${this._renderGridlines(startHour, endHour)}
        ${repeat(dayEvents, ev => ev.id, ev => this._renderEventTile(ev, startHour))}
        ${dayIsToday && this.showCurrentTime ? this._renderNowIndicator(startHour, endHour) : nothing}
      </div>
    `;
  }

  protected render() {
    const timedEvents = this.events.filter(e => !e.isAllDay);
    if (timedEvents.length === 0 && this.allDayEvents.length === 0) {
      return html`<div class="no-events">No events</div>`;
    }

    const { startHour, endHour } = this._getHourRange();
    const totalHeight = (endHour - startHour) * this.pixelsPerHour;
    const days = this._getDays();

    return html`
      ${this._renderMultiDayHeaders(days)}
      <div class="grid-wrapper" style="max-height: ${this.gridHeight}px;">
        <div class="grid-body">
          ${this._renderTimeAxis(startHour, endHour, totalHeight)}
          <div
            class="day-columns"
            style="grid-template-columns: repeat(${days.length}, 1fr);"
          >
            ${days.map(day => this._renderDayColumn(day, startHour, endHour, totalHeight))}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-time-grid': DaylightTimeGrid;
  }
}
