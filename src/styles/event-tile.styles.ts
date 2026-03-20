import { css } from 'lit';

export const eventTileStyles = css`
  :host {
    display: block;
    background: var(--card-background-color, #fff);
    border-radius: 8px;
  }

  .tile {
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    user-select: none;
    transition: filter 0.15s;
    height: 100%;
    box-sizing: border-box;
  }

  .tile:hover {
    filter: brightness(0.95);
  }

  .title {
    font-weight: bold;
    font-size: 0.85em;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .time {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
