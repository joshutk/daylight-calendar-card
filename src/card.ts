import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { cardStyles } from './styles/card.styles';
import type { HomeAssistant, DaylightCardConfig, ViewType, CalendarEvent, ProcessedEvent } from './types';
import { getCalendarColor, DAYLIGHT_ACCENT } from './colors';
import { processEvents } from './event-processor';
import './time-grid';
import './month-grid';
import './agenda-view';
import './detail-popover';
import './all-day-banner';
import './editor';

const ALL_VIEWS: ViewType[] = ['agenda', 'multiday', 'month'];

@customElement('daylight-calendar-card')
export class DaylightCalendarCard extends LitElement {
  static styles = cardStyles;

  static getConfigElement(): HTMLElement {
    return document.createElement('daylight-calendar-card-editor');
  }

  private _hass!: HomeAssistant;

  set hass(value: HomeAssistant) {
    const isFirst = !this._hass;
    this._hass = value;
    this.requestUpdate();
    if (isFirst && this._config) {
      this._fetchEvents();
    }
  }

  get hass(): HomeAssistant {
    return this._hass;
  }

  private _hasFetched = false;
  @state() private _config!: DaylightCardConfig;
  @state() private _currentView: ViewType = 'agenda';
  @state() private _referenceDate: Date = new Date();
  @state() private _events: ProcessedEvent[] = [];
  @state() private _timedEvents: ProcessedEvent[] = [];
  @state() private _allDayEvents: ProcessedEvent[] = [];
  @state() private _loading = false;
  @state() private _error = '';
  @state() private _popoverEvent: ProcessedEvent | null = null;
  @state() private _hiddenCalendars: Set<string> = new Set();

  // HA card lifecycle
  setConfig(config: DaylightCardConfig): void {
    if (!config.entities || config.entities.length === 0) {
      throw new Error('Please define at least one calendar entity');
    }
    const entities = Array.isArray(config.entities)
      ? config.entities
      : [config.entities];
    this._config = { ...config, entities };
    // Normalize legacy/invalid view values
    const VIEW_ALIASES: Record<string, ViewType> = { week: 'multiday', '5day': 'multiday', day: 'agenda' };
    const enabledViews = this._getEnabledViews();
    const rawView = config.default_view ?? 'agenda';
    const resolved = VIEW_ALIASES[rawView] ?? rawView;
    this._currentView = enabledViews.includes(resolved as ViewType)
      ? (resolved as ViewType)
      : enabledViews[0];
    if (this._hass) {
      this._fetchEvents();
    }
  }

  getCardSize(): number {
    return this._currentView === 'month' ? 8 : 5;
  }

  static getStubConfig(): Record<string, unknown> {
    return {
      entities: [],
      default_view: 'agenda',
    };
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('_currentView') || changed.has('_referenceDate')) {
      this._fetchEvents();
    }
  }

  private _getEnabledViews(): ViewType[] {
    return this._config?.enabled_views?.length
      ? this._config.enabled_views
      : ALL_VIEWS;
  }

  private _getAgendaDays(): number {
    return this._config?.agenda_days ?? 7;
  }

  private _getMultiDayCount(): number {
    return this._config?.multi_day_count ?? 5;
  }

  private _getViewLabel(view: ViewType): string {
    switch (view) {
      case 'agenda': return 'Agenda';
      case 'multiday': return `${this._getMultiDayCount()} Day`;
      case 'month': return 'Month';
    }
  }

  private _getDateRange(): { start: Date; end: Date } {
    const ref = this._referenceDate;
    const start = new Date(ref);
    const end = new Date(ref);

    switch (this._currentView) {
      case 'agenda': {
        start.setHours(0, 0, 0, 0);
        const agendaEnd = new Date(start);
        agendaEnd.setDate(start.getDate() + this._getAgendaDays() - 1);
        agendaEnd.setHours(23, 59, 59, 999);
        return { start, end: agendaEnd };
      }
      case 'multiday': {
        const count = this._getMultiDayCount();
        start.setHours(0, 0, 0, 0);
        const multiEnd = new Date(start);
        multiEnd.setDate(start.getDate() + count - 1);
        multiEnd.setHours(23, 59, 59, 999);
        return { start, end: multiEnd };
      }
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(ref.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    return { start, end };
  }

  private async _fetchEvents(): Promise<void> {
    if (!this._hass || !this._config) return;
    this._hasFetched = true;

    const { start, end } = this._getDateRange();
    const params = encodeURI(`?start=${start.toISOString()}&end=${end.toISOString()}`);

    this._loading = true;
    const allEvents: ProcessedEvent[] = [];

    try {
      const fetches = this._config.entities.map(async (entityId, index) => {
        const color = getCalendarColor(this.hass, entityId, index, this._getPalette());
        const events = await this.hass.callApi<CalendarEvent[]>(
          'GET',
          `calendars/${entityId}${params}`,
        );
        return events.filter(ev => ev.start.dateTime || ev.start.date).map((ev): ProcessedEvent => {
          const isAllDay = !!ev.start.date;
          const evStart = (ev.start.dateTime ?? ev.start.date)!;
          const evEnd = (ev.end.dateTime ?? ev.end.date)!;
          return {
            id: `${entityId}-${ev.uid ?? ev.summary}-${evStart}`,
            summary: ev.summary,
            start: new Date(isAllDay ? evStart + 'T00:00:00' : evStart),
            end: new Date(isAllDay ? evEnd + 'T00:00:00' : evEnd),
            description: ev.description,
            location: ev.location,
            uid: ev.uid,
            isAllDay,
            calendarEntity: entityId,
            calendarName: this._getCalendarName(entityId),
            color,
          };
        });
      });

      const results = await Promise.all(fetches);
      for (const batch of results) {
        allEvents.push(...batch);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('daylight-calendar-card: failed to fetch events', e);
      this._error = `Failed to load events: ${msg}`;
      this._loading = false;
      return;
    }

    this._error = '';
    this._events = allEvents;
    this._applyFiltersAndProcess();
    this._loading = false;
  }

  private _navigate(direction: -1 | 1): void {
    const ref = new Date(this._referenceDate);
    switch (this._currentView) {
      case 'agenda':
        ref.setDate(ref.getDate() + direction * this._getAgendaDays());
        break;
      case 'multiday':
        ref.setDate(ref.getDate() + direction * this._getMultiDayCount());
        break;
      case 'month':
        ref.setMonth(ref.getMonth() + direction);
        break;
    }
    this._referenceDate = ref;
  }

  private _goToday(): void {
    this._referenceDate = new Date();
  }

  private _setView(view: ViewType): void {
    this._currentView = view;
  }

  private _formatHeaderDate(): string {
    const ref = this._referenceDate;

    switch (this._currentView) {
      case 'agenda': {
        const agendaStart = new Date(ref);
        const agendaEnd = new Date(ref);
        agendaEnd.setDate(agendaStart.getDate() + this._getAgendaDays() - 1);
        const startStr = agendaStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const endStr = agendaEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} – ${endStr}`;
      }
      case 'multiday': {
        const mdStart = new Date(ref);
        const mdEnd = new Date(ref);
        mdEnd.setDate(mdStart.getDate() + this._getMultiDayCount() - 1);
        const startStr = mdStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const endStr = mdEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} – ${endStr}`;
      }
      case 'month':
        return ref.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
  }

  private _onTileClick(e: CustomEvent): void {
    const ev = e.detail as ProcessedEvent;
    this._popoverEvent = ev;
  }

  private _toggleCalendar(entityId: string): void {
    const next = new Set(this._hiddenCalendars);
    if (next.has(entityId)) {
      next.delete(entityId);
    } else {
      // Don't allow hiding all calendars
      if (next.size < this._config.entities.length - 1) {
        next.add(entityId);
      }
    }
    this._hiddenCalendars = next;
    this._applyFiltersAndProcess();
  }

  private _applyFiltersAndProcess(): void {
    const visible = this._hiddenCalendars.size > 0
      ? this._events.filter(ev => !this._hiddenCalendars.has(ev.calendarEntity))
      : this._events;
    const processed = processEvents([...visible]);
    this._timedEvents = processed.timedEvents;
    this._allDayEvents = processed.allDayEvents;
  }

  private _getPalette(): 'daylight' | 'ha' {
    return this._config?.color_palette ?? 'daylight';
  }

  private _getCalendarName(entityId: string): string {
    const entity = this.hass?.states[entityId];
    const friendlyName = entity?.attributes?.friendly_name as string | undefined;
    return friendlyName ?? entityId.replace('calendar.', '');
  }

  private _onPopoverClose(): void {
    this._popoverEvent = null;
  }

  private _onMoreClick(e: CustomEvent): void {
    const { date } = e.detail as { date: Date };
    this._referenceDate = date;
    this._currentView = 'agenda';
  }

  private _visibleEvents(): ProcessedEvent[] {
    return this._events.filter(ev => !this._hiddenCalendars.has(ev.calendarEntity));
  }

  private _renderContent() {
    if (this._currentView === 'month') {
      return html`
        <daylight-month-grid
          .events=${this._visibleEvents()}
          .referenceDate=${this._referenceDate}
          @tile-click=${this._onTileClick}
          @more-click=${this._onMoreClick}
        ></daylight-month-grid>
      `;
    }

    if (this._currentView === 'agenda') {
      return html`
        <daylight-agenda-view
          .events=${this._visibleEvents()}
          .referenceDate=${this._referenceDate}
          .days=${this._getAgendaDays()}
          @tile-click=${this._onTileClick}
        ></daylight-agenda-view>
      `;
    }

    return html`
      <daylight-time-grid
        .events=${this._timedEvents}
        .allDayEvents=${this._config.show_all_day !== false ? this._allDayEvents : []}
        .allTimedEvents=${this._events.filter(e => !e.isAllDay)}
        .dayCount=${this._getMultiDayCount()}
        .referenceDate=${this._referenceDate}
        .showCurrentTime=${this._config.show_current_time !== false}
        .gridHeight=${this._config.grid_height ?? 500}
        .pixelsPerHour=${this._config.pixels_per_hour ?? 60}
        .hourStart=${this._config.hour_start}
        .hourEnd=${this._config.hour_end}
        @tile-click=${this._onTileClick}
      ></daylight-time-grid>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this._hass && this._config && !this._hasFetched) {
      this._fetchEvents();
    }
  }

  protected render() {
    if (!this._config || !this._hass) return nothing;

    // Failsafe: if we have hass + config but never fetched, kick it off
    if (!this._hasFetched && !this._loading) {
      this._hasFetched = true;
      this._fetchEvents();
    }

    const enabledViews = this._getEnabledViews();

    return html`
      <ha-card style="--daylight-accent: ${this._getPalette() === 'daylight' ? DAYLIGHT_ACCENT : 'var(--primary-color, #03a9f4)'}">
        <div class="header">
          <div class="header-nav">
            <button @click=${() => this._navigate(-1)}>&lsaquo;</button>
            <button @click=${() => this._goToday()}>Today</button>
            <button @click=${() => this._navigate(1)}>&rsaquo;</button>
          </div>
          <div class="header-title">${this._formatHeaderDate()}</div>
          ${enabledViews.length > 1 ? html`
            <div class="view-toggle" role="tablist">
              ${enabledViews.map(
                v => html`
                  <button
                    class=${v === this._currentView ? 'active' : ''}
                    @click=${() => this._setView(v)}
                  >
                    ${this._getViewLabel(v)}
                  </button>
                `,
              )}
            </div>
          ` : nothing}
        </div>
        ${this._config.show_legend !== false ? html`<div class="legend">
          ${this._config.entities.map(
            (entityId, index) => {
              const hidden = this._hiddenCalendars.has(entityId);
              return html`
                <button
                  class="legend-item ${hidden ? 'hidden' : ''}"
                  @click=${() => this._toggleCalendar(entityId)}
                >
                  <span
                    class="legend-dot"
                    style="background: ${hidden ? 'transparent' : getCalendarColor(this.hass, entityId, index, this._getPalette())}; border: 2px solid ${getCalendarColor(this.hass, entityId, index, this._getPalette())};"
                  ></span>
                  ${this._getCalendarName(entityId)}
                </button>
              `;
            },
          )}
        </div>` : nothing}
        <div class="content">
          ${this._error
            ? html`<div class="placeholder" style="color: var(--error-color, #db4437);">${this._error}</div>`
            : this._loading
              ? html`<div class="placeholder">Loading...</div>`
              : this._renderContent()}
        </div>
        <daylight-detail-popover
          .event=${this._popoverEvent}
          @popover-close=${this._onPopoverClose}
        ></daylight-detail-popover>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-calendar-card': DaylightCalendarCard;
  }
}
