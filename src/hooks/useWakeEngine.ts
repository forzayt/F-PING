import { useEffect, useRef, useState } from "react";
import {
  getState,
  recordRun,
  setStatus,
  subscribe,
  useStore,
} from "@/lib/store";
import { notify, playBlip } from "@/lib/notify";
import { randomLine } from "@/lib/humor";

type NextMap = Record<string, number>;

let nextRuns: NextMap = {};
const nextListeners = new Set<() => void>();
const emitNext = () => nextListeners.forEach((l) => l());

export function useNextRuns() {
  const [, force] = useState(0);
  useEffect(() => {
    const cb = () => force((n) => n + 1);
    nextListeners.add(cb);
    const t = setInterval(cb, 1000);
    return () => {
      nextListeners.delete(cb);
      clearInterval(t);
    };
  }, []);
  return nextRuns;
}

export async function pingMonitor(id: string, manual = false) {
  const monitor = getState().monitors.find((m) => m.id === id);
  if (!monitor || !monitor.url) return;
  const { settings } = getState();
  setStatus(id, "waiting");
  try {
    await fetch(monitor.url, {
      method: monitor.method,
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
    });
    recordRun(
      monitor,
      "sent",
      manual ? "Manual wake request sent" : randomLine(),
    );
    if (settings.sounds) playBlip("ok");
  } catch {
    recordRun(monitor, "error", "Network error — the door didn't even rattle.");
    if (settings.sounds) playBlip("error");
    if (settings.notifications)
      notify("FPING — network error", `${monitor.name} could not be reached.`);
  }
}

/** Schedules an independent timer per enabled monitor. */
export function useWakeEngine() {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let disposed = false;

    const schedule = (id: string, delayMs: number) => {
      clearTimeout(timers.current[id]);
      nextRuns = { ...nextRuns, [id]: Date.now() + delayMs };
      emitNext();
      timers.current[id] = setTimeout(async () => {
        if (disposed) return;
        const m = getState().monitors.find((x) => x.id === id);
        if (!m || !m.enabled) return;
        await pingMonitor(id);
        if (disposed) return;
        const fresh = getState().monitors.find((x) => x.id === id);
        if (fresh?.enabled) schedule(id, Math.max(5, fresh.intervalSec) * 1000);
      }, delayMs);
    };

    const sync = () => {
      const monitors = getState().monitors;
      const active = new Set<string>();
      for (const m of monitors) {
        if (!m.enabled || !m.url) continue;
        active.add(m.id);
        if (!timers.current[m.id]) {
          schedule(m.id, 2000);
          if (m.lastStatus !== "scheduled") setStatus(m.id, "scheduled");
        }

      }
      for (const id of Object.keys(timers.current)) {
        if (!active.has(id)) {
          clearTimeout(timers.current[id]);
          delete timers.current[id];
          const { [id]: _, ...rest } = nextRuns;
          nextRuns = rest;
          emitNext();
        }
      }
    };

    sync();
    const unsub = subscribe(sync);
    return () => {
      disposed = true;
      unsub();
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);
}

export function useEnabledCount() {
  return useStore((s) => s.monitors.filter((m) => m.enabled).length);
}

export function forceRunAll() {
  getState()
    .monitors.filter((m) => m.enabled)
    .forEach((m) => pingMonitor(m.id, true));
}
