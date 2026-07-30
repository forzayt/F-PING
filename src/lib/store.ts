import { useSyncExternalStore } from "react";
import type { AppState, DayStat, LogEntry, Monitor, Settings } from "@/types";

const KEY = "fping.state.v1";

export const DEFAULT_SETTINGS: Settings = {
  humor: true,
  notifications: false,
  sounds: false,
  compact: false,
  accent: "mint",
  logLimit: 300,
};

const EMPTY: AppState = {
  monitors: [],
  logs: [],
  stats: [],
  settings: DEFAULT_SETTINGS,
};

let state: AppState = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of Array.from(listeners)) {
    try {
      l();
    } catch (err) {
      console.error("[fping] store listener failed", err);
    }
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — ignore */
  }
}

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        monitors: (parsed.monitors ?? []).map((m) => ({
          ...m,
          lastStatus: m.enabled ? "scheduled" : "paused",
        })) as Monitor[],
        logs: parsed.logs ?? [],
        stats: parsed.stats ?? [],
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      };
    }
  } catch {
    state = EMPTY;
  }
  emit();
}

function set(next: Partial<AppState>, save = true) {
  state = { ...state, ...next };
  if (save) persist();
  emit();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export const getState = () => state;
const getServerSnapshot = () => EMPTY;

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(EMPTY),
  );
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getServerSnapshot);
}

/* ---------------- actions ---------------- */

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const PALETTE = [
  "#5eead4",
  "#a3e635",
  "#fbbf24",
  "#f472b6",
  "#60a5fa",
  "#f87171",
  "#c4b5fd",
  "#34d399",
];

export function createMonitor(input: Partial<Monitor>): Monitor {
  const m: Monitor = {
    id: uid(),
    name: input.name?.trim() || "Untitled service",
    url: input.url?.trim() || "",
    icon: input.icon || "Server",
    color: input.color || PALETTE[0],
    category: input.category?.trim() || "General",
    tags: input.tags ?? [],
    notes: input.notes ?? "",
    method: input.method ?? "GET",
    intervalSec: input.intervalSec ?? 600,
    enabled: input.enabled ?? true,
    favorite: input.favorite ?? false,
    order: state.monitors.length,
    createdAt: Date.now(),
    totalRequests: 0,
    errorCount: 0,
    lastRunAt: null,
    lastStatus: input.enabled === false ? "paused" : "scheduled",
  };
  set({ monitors: [...state.monitors, m] });
  return m;
}

export function updateMonitor(id: string, patch: Partial<Monitor>) {
  set({
    monitors: state.monitors.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  });
}

export function removeMonitor(id: string) {
  set({ monitors: state.monitors.filter((m) => m.id !== id) });
}

export function setMonitors(monitors: Monitor[]) {
  set({ monitors });
}

export function reorderMonitors(fromId: string, toId: string) {
  const list = [...state.monitors].sort((a, b) => a.order - b.order);
  const from = list.findIndex((m) => m.id === fromId);
  const to = list.findIndex((m) => m.id === toId);
  if (from < 0 || to < 0 || from === to) return;
  const [moved] = list.splice(from, 1);
  list.splice(to, 0, moved);
  set({ monitors: list.map((m, i) => ({ ...m, order: i })) });
}

export function bulkEnable(enabled: boolean, ids?: string[]) {
  set({
    monitors: state.monitors.map((m) =>
      !ids || ids.includes(m.id)
        ? { ...m, enabled, lastStatus: enabled ? "scheduled" : "paused" }
        : m,
    ),
  });
}

export function updateSettings(patch: Partial<Settings>) {
  set({ settings: { ...state.settings, ...patch } });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function recordRun(
  monitor: Monitor,
  status: "sent" | "error" | "waiting",
  message: string,
) {
  const monitors = state.monitors.map((m) =>
    m.id === monitor.id
      ? {
          ...m,
          lastStatus: status,
          lastRunAt: status === "waiting" ? m.lastRunAt : Date.now(),
          totalRequests: m.totalRequests + (status === "waiting" ? 0 : 1),
          errorCount: m.errorCount + (status === "error" ? 1 : 0),
        }
      : m,
  );

  let logs = state.logs;
  let stats = state.stats;

  if (status !== "waiting") {
    const entry: LogEntry = {
      id: uid(),
      monitorId: monitor.id,
      monitorName: monitor.name,
      at: Date.now(),
      status,
      message,
    };
    logs = [entry, ...state.logs].slice(0, state.settings.logLimit);

    const day = todayKey();
    const existing = stats.find((s) => s.day === day);
    const updated: DayStat = existing
      ? {
          ...existing,
          requests: existing.requests + 1,
          errors: existing.errors + (status === "error" ? 1 : 0),
        }
      : { day, requests: 1, errors: status === "error" ? 1 : 0 };
    stats = [...stats.filter((s) => s.day !== day), updated]
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-30);
  }

  set({ monitors, logs, stats });
}

export function setStatus(id: string, lastStatus: Monitor["lastStatus"]) {
  set(
    {
      monitors: state.monitors.map((m) =>
        m.id === id ? { ...m, lastStatus } : m,
      ),
    },
    false,
  );
}

export function clearLogs() {
  set({ logs: [] });
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(raw: string) {
  const parsed = JSON.parse(raw) as Partial<AppState>;
  if (!Array.isArray(parsed.monitors)) throw new Error("Invalid backup file");
  set({
    monitors: parsed.monitors as Monitor[],
    logs: parsed.logs ?? [],
    stats: parsed.stats ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
  });
}

export function resetAll() {
  set({ ...EMPTY });
}
