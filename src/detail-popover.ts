import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ProcessedEvent } from './types';

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

// Clean SVG icons (16x16, single path, neutral stroke)
const ICON_DATE = html`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="3" width="12" height="11" rx="1.5"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="5" y1="1.5" x2="5" y2="4"/><line x1="11" y1="1.5" x2="11" y2="4"/></svg>`;
const ICON_TIME = html`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="8" cy="8" r="6"/><polyline points="8,4.5 8,8 10.5,10"/></svg>`;
const ICON_LOCATION = html`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z"/><circle cx="8" cy="6" r="1.5"/></svg>`;

@customElement('daylight-detail-popover')
export class DaylightDetailPopover extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      background: rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popover {
      z-index: 1000;
      width: min(520px, 88vw);
      max-height: 80vh;
      overflow-y: auto;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color);
      border-radius: 18px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: 32px 36px;
      box-sizing: border-box;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: calc(1.3em * var(--daylight-font-scale, 1));
      padding: 4px 10px;
      border-radius: 6px;
      line-height: 1;
    }

    .close-btn:hover {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    }

    .title {
      font-weight: 600;
      font-size: calc(1.3em * var(--daylight-font-scale, 1));
      margin-bottom: 14px;
      padding-right: 28px;
      color: var(--primary-text-color);
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: calc(1.05em * var(--daylight-font-scale, 1));
      color: var(--primary-text-color);
      margin-bottom: 10px;
    }

    .detail-row .icon {
      color: var(--secondary-text-color);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .detail-row .icon svg {
      width: calc(18px * var(--daylight-font-scale, 1));
      height: calc(18px * var(--daylight-font-scale, 1));
    }

    .description {
      font-size: calc(0.95em * var(--daylight-font-scale, 1));
      color: var(--primary-text-color);
      margin-top: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
      padding: 14px 16px;
      border-radius: 10px;
    }

    .calendar-names {
      font-size: calc(0.88em * var(--daylight-font-scale, 1));
      color: var(--secondary-text-color);
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .calendar-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .calendar-tag .tag-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `;

  @property({ attribute: false }) event: ProcessedEvent | null = null;

  private _close(): void {
    this.dispatchEvent(
      new CustomEvent('popover-close', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onBackdropClick(e: Event): void {
    e.stopPropagation();
    this._close();
  }

  private _formatTimeRange(ev: ProcessedEvent): string {
    if (ev.isAllDay) return 'All day';
    const start = ev.start.toLocaleTimeString(undefined, TIME_FORMAT);
    const end = ev.end.toLocaleTimeString(undefined, TIME_FORMAT);
    return `${start} \u2013 ${end}`;
  }

  private _formatDate(ev: ProcessedEvent): string {
    return ev.start.toLocaleDateString(undefined, DATE_FORMAT);
  }

  protected render() {
    if (!this.event) return nothing;

    const ev = this.event;

    return html`
      <div class="backdrop" @click=${this._onBackdropClick}>
      <div
        class="popover"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <button class="close-btn" @click=${this._close}>&times;</button>
        <div class="title">${ev.summary}</div>
        <div class="detail-row">
          <span class="icon">${ICON_DATE}</span>
          <span>${this._formatDate(ev)}</span>
        </div>
        <div class="detail-row">
          <span class="icon">${ICON_TIME}</span>
          <span>${this._formatTimeRange(ev)}</span>
        </div>
        ${ev.location
          ? html`
              <div class="detail-row">
                <span class="icon">${ICON_LOCATION}</span>
                <span>${ev.location}</span>
              </div>
            `
          : nothing}
        ${ev.description
          ? html`<div class="description">${ev.description}</div>`
          : nothing}
        <div class="calendar-names">
          ${ev.sharedCalendarNames && ev.sharedCalendarNames.length >= 2
            ? ev.sharedCalendarNames.map((name, i) => html`
                <span class="calendar-tag">
                  <span class="tag-dot" style="background: ${ev.sharedColors![i]};"></span>
                  ${name}
                </span>
              `)
            : html`<span class="calendar-tag">
                <span class="tag-dot" style="background: ${ev.color};"></span>
                ${ev.calendarName}
              </span>`}
        </div>
      </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-detail-popover': DaylightDetailPopover;
  }
}
