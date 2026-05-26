import { css } from 'lit';

export const eventTileStyles = css`
  :host {
    display: block;
    background: var(--card-background-color, #fff);
    border-radius: 8px;
  }

  .tile {
    padding: 5px 8px;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    user-select: none;
    transition: filter 0.15s;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .tile:hover {
    filter: var(--daylight-tile-hover-filter, brightness(0.95));
  }

  :host([compact]) .tile {
    padding: 2px 6px;
  }

  .title {
    font-weight: bold;
    font-size: calc(0.92em * var(--daylight-font-scale, 1));
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }

  :host([compact]) .title {
    font-size: calc(0.82em * var(--daylight-font-scale, 1));
  }

  .time {
    font-size: calc(0.82em * var(--daylight-font-scale, 1));
    color: var(--secondary-text-color);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    min-height: 0;
  }

  .compact-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
  }

  .compact-row .title {
    flex-shrink: 1;
    min-width: 0;
  }

  .compact-time {
    font-size: calc(0.78em * var(--daylight-font-scale, 1));
    color: var(--secondary-text-color);
    white-space: nowrap;
    flex-shrink: 0;
    margin-left: auto;
  }

  .calendar-dots {
    display: flex;
    gap: 3px;
    margin-top: 3px;
    flex-shrink: 1;
    min-height: 0;
  }

  .cal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
`;
