import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { eventTileStyles } from './styles/event-tile.styles';
import type { ProcessedEvent } from './types';
import { pastelBackground, stripeBackground } from './colors';

function hour12(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hr}` : `${hr}:${String(m).padStart(2, '0')}`;
}

function period(date: Date): string {
  return date.getHours() < 12 ? 'a.m.' : 'p.m.';
}

function shortTimeRange(start: Date, end: Date): string {
  const samePeriod = period(start) === period(end);
  if (samePeriod) {
    return `${hour12(start)}\u2013${hour12(end)} ${period(end)}`;
  }
  return `${hour12(start)} ${period(start)}\u2013${hour12(end)} ${period(end)}`;
}

@customElement('daylight-event-tile')
export class DaylightEventTile extends LitElement {
  static styles = eventTileStyles;

  @property({ attribute: false }) event!: ProcessedEvent;
  @property({ type: Boolean }) compact = false;

  private _onClick(): void {
    this.dispatchEvent(
      new CustomEvent('tile-click', {
        bubbles: true,
        composed: true,
        detail: this.event,
      }),
    );
  }

  private _getBackground(): string {
    const { sharedColors, color } = this.event;
    if (sharedColors && sharedColors.length >= 2) {
      return stripeBackground(sharedColors);
    }
    return pastelBackground(color);
  }

  protected render() {
    const bg = this._getBackground();

    return html`
      <div
        class="tile"
        style="background: ${bg}; --tile-color: ${this.event.color};"
        @click=${this._onClick}
      >
        <div class="title">${this.event.summary}</div>
        ${this.compact
          ? ''
          : html`
              <div class="time">
                ${shortTimeRange(this.event.start, this.event.end)}
              </div>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-event-tile': DaylightEventTile;
  }
}
