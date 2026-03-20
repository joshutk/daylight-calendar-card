import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { agendaViewStyles } from './styles/agenda-view.styles';
import type { ProcessedEvent } from './types';
import { pastelBackground } from './colors';
import { isToday, formatTimeRange, formatDayHeader } from './utils';

interface DaySection {
  date: Date;
  label: string;
  isToday: boolean;
  allDay: ProcessedEvent[];
  timed: ProcessedEvent[];
}

@customElement('daylight-agenda-view')
export class DaylightAgendaView extends LitElement {
  static styles = agendaViewStyles;

  @property({ attribute: false }) events: ProcessedEvent[] = [];
  @property({ attribute: false }) referenceDate: Date = new Date();
  @property({ type: Number }) days = 7;

  private _buildSections(): DaySection[] {
    const ref = new Date(this.referenceDate);
    ref.setHours(0, 0, 0, 0);
    const sections: DaySection[] = [];

    for (let i = 0; i < this.days; i++) {
      const day = new Date(ref);
      day.setDate(ref.getDate() + i);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayEvents = this.events.filter(
        ev => ev.start < dayEnd && ev.end > dayStart,
      );

      const allDay = dayEvents.filter(ev => ev.isAllDay);
      const timed = dayEvents
        .filter(ev => !ev.isAllDay)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      sections.push({
        date: day,
        label: formatDayHeader(day),
        isToday: isToday(day),
        allDay,
        timed,
      });
    }

    return sections;
  }

  private _fireClick(ev: ProcessedEvent): void {
    this.dispatchEvent(
      new CustomEvent('tile-click', {
        bubbles: true,
        composed: true,
        detail: ev,
      }),
    );
  }

  private _renderEvent(ev: ProcessedEvent) {
    return html`
      <div
        class="agenda-event"
        @click=${() => this._fireClick(ev)}
      >
        <div
          class="event-color-bar"
          style="background: ${ev.color};"
        ></div>
        <div class="event-content">
          <div class="event-title">${ev.summary}</div>
          <div class="event-time">
            ${ev.isAllDay ? 'All day' : formatTimeRange(ev.start, ev.end)}
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    const sections = this._buildSections();
    const hasAnyEvents = sections.some(s => s.allDay.length > 0 || s.timed.length > 0);

    if (!hasAnyEvents) {
      return html`<div class="no-events">No upcoming events</div>`;
    }

    return html`
      <div class="agenda-container">
        ${repeat(sections, s => s.date.toISOString(), section => html`
          <div class="day-section ${section.isToday ? 'today' : ''}">
            <div class="day-header">
              <span class="day-label ${section.isToday ? 'today' : ''}">${section.label}</span>
            </div>
            ${section.allDay.length > 0 || section.timed.length > 0
              ? html`
                <div class="day-events">
                  ${repeat(section.allDay, ev => ev.id, ev => html`
                    <div
                      class="agenda-event all-day"
                      @click=${() => this._fireClick(ev)}
                    >
                      <div class="event-chip" style="background: ${pastelBackground(ev.color)};">
                        ${ev.summary}
                      </div>
                    </div>
                  `)}
                  ${repeat(section.timed, ev => ev.id, ev => this._renderEvent(ev))}
                </div>
              `
              : html`<div class="day-empty">No events</div>`}
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-agenda-view': DaylightAgendaView;
  }
}
