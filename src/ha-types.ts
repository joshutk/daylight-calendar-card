// Minimal Home Assistant type definitions for card development.
// These cover what we actually use — not the full HA type surface.

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callApi: <T>(method: string, path: string, parameters?: Record<string, unknown>) => Promise<T>;
  themes: {
    darkMode: boolean;
  };
  language: string;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}
