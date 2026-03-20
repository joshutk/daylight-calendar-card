import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
  }

  ha-card {
    padding: 16px;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .header-title {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .header-nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-nav button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--primary-text-color);
    font-size: 0.9em;
  }

  .header-nav button:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
  }

  .view-toggle {
    display: flex;
    gap: 2px;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    border-radius: 6px;
    padding: 2px;
  }

  .view-toggle button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.8em;
    color: var(--secondary-text-color);
    transition: background 0.15s, color 0.15s;
  }

  .view-toggle button.active {
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    padding: 0 2px;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 20px;
    border: none;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    font-size: 0.85em;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    cursor: pointer;
    transition: opacity 0.2s, background 0.15s;
    font-family: inherit;
  }

  .legend-item:hover {
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.08));
  }

  .legend-item.hidden {
    opacity: 0.45;
  }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    box-sizing: border-box;
    transition: background 0.2s, transform 0.2s;
  }

  .legend-item.hidden .legend-dot {
    transform: scale(0.7);
  }

  .content {
    min-height: 200px;
    color: var(--primary-text-color);
    position: relative;
  }

  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--secondary-text-color);
    font-style: italic;
  }
`;
