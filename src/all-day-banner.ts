import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ProcessedEvent } from './types';
import { pastelBackground } from './colors';

const MAX_VISIBLE = 2;
const OVERFLOW_THRESHOLD = 3;

@customElement('daylight-all-day-banner')
export class DaylightAllDayBanner extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 28px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
    }

    .banner {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.78em;
      font-weight: 500;
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
      cursor: default;
    }

    .chip.more {
      border-left: none;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
      color: var(--secondary-text-color);
      font-size: 0.72em;
    }
  `;

  @property({ attribute: false }) events: ProcessedEvent[] = [];

  protected render() {
    if (this.events.length === 0) return nothing;

    const overflow = this.events.length > OVERFLOW_THRESHOLD;
    const visible = overflow ? this.events.slice(0, MAX_VISIBLE) : this.events;
    const remaining = this.events.length - MAX_VISIBLE;

    return html`
      <div class="banner">
        ${visible.map(
          ev => html`
            <span
              class="chip"
              style="background: ${pastelBackground(ev.color)}; --chip-color: ${ev.color};"
              title="${ev.summary}"
            >
              ${ev.summary}
            </span>
          `,
        )}
        ${overflow
          ? html`<span class="chip more">+${remaining} more</span>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-all-day-banner': DaylightAllDayBanner;
  }
}
