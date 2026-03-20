import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, DaylightCardConfig } from './types';

@customElement('daylight-calendar-card-editor')
export class DaylightCalendarCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: DaylightCardConfig;

  static styles = css`
    :host {
      display: block;
    }

    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    ha-selector {
      width: 100%;
    }

    ha-expansion-panel {
      margin-top: 4px;
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 12px 4px;
    }
  `;

  setConfig(config: DaylightCardConfig): void {
    this._config = { ...config };
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config) return;
    const target = ev.target as HTMLElement & { configKey: string };
    const key = target.configKey;
    if (!key) return;
    const value = ev.detail.value;

    // Remove key if value is undefined/default to keep config clean
    const newConfig = { ...this._config, [key]: value };
    this._config = newConfig;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: newConfig },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected render() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="card-config">

        <!-- Calendars -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Calendar Entities'}
          .selector=${{ entity: { multiple: true, domain: 'calendar' } }}
          .value=${this._config.entities}
          .configKey=${'entities'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Color Palette -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Color Palette'}
          .selector=${{ select: { options: [
            { value: 'daylight', label: 'Daylight (coral, sage, sky...)' },
            { value: 'ha',       label: 'Home Assistant (entity colors + theme)' },
          ]}}}
          .value=${this._config.color_palette ?? 'daylight'}
          .configKey=${'color_palette'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Default View -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Default View'}
          .selector=${{ select: { options: [
            { value: 'agenda',   label: 'Agenda' },
            { value: 'multiday', label: 'Multi-Day' },
            { value: 'month',    label: 'Month' },
          ]}}}
          .value=${this._config.default_view ?? 'agenda'}
          .configKey=${'default_view'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Enabled Views -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Enabled Views'}
          .selector=${{ select: { multiple: true, options: [
            { value: 'agenda',   label: 'Agenda' },
            { value: 'multiday', label: 'Multi-Day' },
            { value: 'month',    label: 'Month' },
          ]}}}
          .value=${this._config.enabled_views ?? ['agenda', 'multiday', 'month']}
          .configKey=${'enabled_views'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Agenda Days -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Agenda Days'}
          .selector=${{ number: { min: 1, max: 30, step: 1, mode: 'box' } }}
          .value=${this._config.agenda_days ?? 7}
          .configKey=${'agenda_days'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Multi-Day Column Count -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Multi-Day Columns'}
          .selector=${{ number: { min: 1, max: 7, step: 1, mode: 'box' } }}
          .value=${this._config.multi_day_count ?? 5}
          .configKey=${'multi_day_count'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Show Legend -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Show Calendar Legend'}
          .selector=${{ boolean: {} }}
          .value=${this._config.show_legend !== false}
          .configKey=${'show_legend'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Show All-Day Events -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Show All-Day Events'}
          .selector=${{ boolean: {} }}
          .value=${this._config.show_all_day !== false}
          .configKey=${'show_all_day'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Show Current Time Indicator -->
        <ha-selector
          .hass=${this.hass}
          .label=${'Show Current Time Indicator'}
          .selector=${{ boolean: {} }}
          .value=${this._config.show_current_time !== false}
          .configKey=${'show_current_time'}
          @value-changed=${this._valueChanged}
        ></ha-selector>

        <!-- Advanced Section -->
        <ha-expansion-panel .header=${'Advanced'} .outlined=${true}>
          <div class="panel-content">

            <!-- Grid Height -->
            <ha-selector
              .hass=${this.hass}
              .label=${'Grid Height (px)'}
              .selector=${{ number: { min: 200, max: 1200, step: 50, mode: 'box' } }}
              .value=${this._config.grid_height ?? 500}
              .configKey=${'grid_height'}
              @value-changed=${this._valueChanged}
            ></ha-selector>

            <!-- Pixels Per Hour -->
            <ha-selector
              .hass=${this.hass}
              .label=${'Pixels Per Hour'}
              .selector=${{ number: { min: 40, max: 120, step: 5, mode: 'slider' } }}
              .value=${this._config.pixels_per_hour ?? 60}
              .configKey=${'pixels_per_hour'}
              @value-changed=${this._valueChanged}
            ></ha-selector>

            <!-- Hour Start -->
            <ha-selector
              .hass=${this.hass}
              .label=${'Hour Start (fixed)'}
              .helper=${'Override auto-range. Leave empty for auto.'}
              .selector=${{ number: { min: 0, max: 23, step: 1, mode: 'box' } }}
              .value=${this._config.hour_start}
              .configKey=${'hour_start'}
              @value-changed=${this._valueChanged}
            ></ha-selector>

            <!-- Hour End -->
            <ha-selector
              .hass=${this.hass}
              .label=${'Hour End (fixed)'}
              .helper=${'Override auto-range. Leave empty for auto.'}
              .selector=${{ number: { min: 1, max: 24, step: 1, mode: 'box' } }}
              .value=${this._config.hour_end}
              .configKey=${'hour_end'}
              @value-changed=${this._valueChanged}
            ></ha-selector>

          </div>
        </ha-expansion-panel>

      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'daylight-calendar-card-editor': DaylightCalendarCardEditor;
  }
}
