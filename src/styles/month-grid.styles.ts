import { css } from 'lit';

export const monthGridStyles = css`
  :host {
    display: block;
  }

  .month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-radius: 6px;
    overflow: hidden;
  }

  /* Day-of-week header row */
  .dow-header {
    text-align: center;
    padding: 8px 4px;
    font-size: 0.75em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--secondary-text-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  /* Day cells */
  .day-cell {
    min-height: 80px;
    padding: 4px;
    border-right: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  /* Remove right border on last column */
  .day-cell:nth-child(7n) {
    border-right: none;
  }

  /* Remove bottom border on last row */
  .month-grid .day-cell:nth-last-child(-n + 7) {
    border-bottom: none;
  }

  .day-cell.outside {
    opacity: 0.4;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.02));
  }

  .day-cell.today {
    background: color-mix(in srgb, var(--daylight-accent, #03a9f4) 6%, transparent);
  }

  .day-number {
    font-size: 0.8em;
    font-weight: 500;
    color: var(--primary-text-color);
    padding: 2px 4px;
    line-height: 1;
    align-self: flex-start;
  }

  .day-cell.today .day-number {
    font-weight: 700;
    background: var(--daylight-accent, #03a9f4);
    color: var(--text-primary-color, #fff);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .day-cell.outside .day-number {
    color: var(--disabled-text-color, var(--secondary-text-color));
  }

  /* Event chips */
  .event-chips {
    display: flex;
    flex-direction: column;
    gap: 1px;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  .event-chip {
    display: flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7em;
    line-height: 1.3;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--primary-text-color);
    user-select: none;
    transition: filter 0.15s;
  }

  .event-chip:hover {
    filter: brightness(0.92);
  }

  .more-chip {
    font-size: 0.65em;
    color: var(--secondary-text-color);
    padding: 2px 6px;
    cursor: pointer;
    font-weight: 500;
  }

  .more-chip:hover {
    color: var(--primary-text-color);
    text-decoration: underline;
  }
`;
