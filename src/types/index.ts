export type HttpMethod = "GET" | "HEAD" | "POST";

export type MonitorStatus =
  | "idle"
  | "scheduled"
  | "waiting"
  | "sent"
  | "error"
  | "paused";

export interface Monitor {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  notes: string;
  method: HttpMethod;
  intervalSec: number;
  enabled: boolean;
  favorite: boolean;
  order: number;
  createdAt: number;
  /** runtime-ish, but persisted so counters survive reloads */
  totalRequests: number;
  errorCount: number;
  lastRunAt: number | null;
  lastStatus: MonitorStatus;
}

export interface LogEntry {
  id: string;
  monitorId: string;
  monitorName: string;
  at: number;
  status: MonitorStatus;
  message: string;
}

export interface DayStat {
  day: string; // YYYY-MM-DD
  requests: number;
  errors: number;
}

export interface Settings {
  humor: boolean;
  notifications: boolean;
  sounds: boolean;
  compact: boolean;
  accent: string;
  logLimit: number;
}

export interface AppState {
  monitors: Monitor[];
  logs: LogEntry[];
  stats: DayStat[];
  settings: Settings;
}
