import { css } from 'lit';

export const timeGridStyles = css`
  :host {
    display: block;
  }

  .grid-wrapper {
    overflow-y: auto;
    max-height: var(--time-grid-max-height, 500px);
    position: relative;
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 16px,
      black calc(100% - 16px),
      transparent
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent,
      black 16px,
      black calc(100% - 16px),
      transparent
    );
  }

  /* Time axis (left column) */
  .time-axis {
    position: relative;
    width: 50px;
    min-width: 50px;
  }

  .time-label {
    position: absolute;
    right: 8px;
    transform: translateY(-50%);
    font-size: 0.7em;
    color: var(--secondary-text-color);
    white-space: nowrap;
    pointer-events: none;
    line-height: 1;
  }

  /* Day columns container */
  .day-columns {
    display: grid;
    flex: 1;
    min-width: 0;
  }

  .day-column {
    position: relative;
    min-width: 0;
    border-left: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .day-column:first-child {
    border-left: none;
  }

  .day-column.today {
    background: color-mix(in srgb, var(--daylight-accent, #03a9f4) 6%, transparent);
  }

  /* Multi-day headers (5-day view) — Daylight style */
  .multi-day-headers {
    display: flex;
    align-items: baseline;
    padding-bottom: 6px;
  }

  .time-axis-spacer {
    width: 50px;
    min-width: 50px;
    flex-shrink: 0;
  }

  .multi-day-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 8px 4px 4px;
    min-width: 0;
  }

  .header-label-row {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .header-all-day-events {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 4px;
    max-height: 200px;
    overflow: hidden;
    transition: max-height 0.3s ease, margin-top 0.3s ease;
  }

  .header-all-day-events.empty {
    max-height: 0;
    margin-top: 0;
  }

  .header-all-day-chip {
    padding: 3px 6px;
    border-radius: 6px;
    font-size: 0.75em;
    font-weight: 500;
    color: var(--primary-text-color);
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .header-all-day-chip.exiting,
  .header-all-day-chip.entering {
    opacity: 0;
    transform: scale(0.92);
  }

  .header-all-day-chip:hover {
    filter: brightness(0.95);
  }

  .header-day-name {
    font-size: 1.05em;
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .multi-day-header.today .header-day-name {
    color: var(--daylight-accent, #03a9f4);
  }

  .header-day-number {
    font-size: 1.05em;
    font-weight: 400;
    color: var(--secondary-text-color);
  }

  .today-badge {
    background: var(--daylight-accent, #03a9f4);
    color: var(--text-primary-color, #fff) !important;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.9em;
    line-height: 1;
  }


  /* Event tiles inside the grid */
  .event-positioner {
    position: absolute;
    box-sizing: border-box;
    padding: 2px 2px;
    overflow: hidden;
    z-index: 1;
    transition: left 0.3s ease, width 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  }

  .event-positioner.exiting,
  .event-positioner.entering {
    opacity: 0;
    transform: scale(0.92);
    pointer-events: none;
    z-index: 0;
  }

  .event-positioner daylight-event-tile {
    height: 100%;
  }

  /* Gridlines at slot boundaries */
  .gridline {
    position: absolute;
    left: 0;
    right: 0;
    height: 0;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    pointer-events: none;
    z-index: 0;
  }

  /* Grid body layout */
  .grid-body {
    display: flex;
    position: relative;
  }

  /* Current time indicator */
  .now-indicator {
    position: absolute;
    left: -5px;
    right: 0;
    height: 0;
    z-index: 3;
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .now-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--daylight-accent, #03a9f4);
    flex-shrink: 0;
  }

  .now-line {
    flex: 1;
    height: 2px;
    background: var(--daylight-accent, #03a9f4);
    opacity: 0.5;
  }

  .no-events {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: var(--secondary-text-color);
    font-style: italic;
    font-size: 0.9em;
  }
`;
