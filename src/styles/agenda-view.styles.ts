import { css } from 'lit';

export const agendaViewStyles = css`
  :host {
    display: block;
  }

  .agenda-container {
    display: flex;
    flex-direction: column;
  }

  .day-section {
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .day-section:last-child {
    border-bottom: none;
  }

  .day-header {
    padding: 10px 8px 4px;
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--card-background-color, #fff);
  }

  .day-label {
    font-size: calc(0.95em * var(--daylight-font-scale, 1));
    font-weight: 600;
    color: var(--primary-text-color);
  }

  .day-label.today {
    color: var(--daylight-accent, #03a9f4);
  }

  .day-events {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 4px 8px 10px;
  }

  .day-empty {
    padding: 4px 8px 10px;
    font-size: calc(0.9em * var(--daylight-font-scale, 1));
    color: var(--secondary-text-color);
    font-style: italic;
  }

  .agenda-event {
    display: flex;
    align-items: stretch;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
  }

  .agenda-event:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
  }

  .event-color-bar {
    width: 5px;
    border-radius: 2.5px;
    flex-shrink: 0;
  }

  .event-color-stack {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 5px;
    flex-shrink: 0;
  }

  .color-segment {
    flex: 1;
    min-height: 6px;
    width: 5px;
    border-radius: 2.5px;
  }

  .event-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .event-title {
    font-size: calc(0.95em * var(--daylight-font-scale, 1));
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .event-time {
    font-size: calc(0.85em * var(--daylight-font-scale, 1));
    color: var(--secondary-text-color);
  }

  .agenda-event.all-day {
    padding: 0;
  }

  .event-chip {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: calc(0.9em * var(--daylight-font-scale, 1));
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .no-events {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    color: var(--secondary-text-color);
    font-style: italic;
    font-size: calc(0.95em * var(--daylight-font-scale, 1));
  }
`;
