import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCheck, Pause, Play, Search, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MonitorCard } from "@/components/MonitorCard";
import { MiniChart } from "@/components/MiniChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { bulkEnable, reorderMonitors, useStore } from "@/lib/store";
import { forceRunAll, useNextRuns } from "@/hooks/useWakeEngine";
import { EMPTY_LINES } from "@/lib/humor";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPING — Keep your sleeping services awake" },
      {
        name: "description",
        content:
          "FPING is a local-first dashboard that sends periodic wake requests to your self-hosted and free-tier services while the tab stays open.",
      },
      { property: "og:title", content: "FPING — Keep your sleeping services awake" },
      {
        property: "og:description",
        content:
          "A premium, local-first service awakener. Unlimited monitors, live countdowns, zero backend.",
      },
    ],
  }),
  component: Dashboard,
});

type Filter = "all" | "active" | "paused" | "favorites";

function Dashboard() {
  const monitors = useStore((s) => s.monitors);
  const stats = useStore((s) => s.stats);
  const compact = useStore((s) => s.settings.compact);
  const nextRuns = useNextRuns();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const dragId = useRef<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(monitors.map((m) => m.category))).sort(),
    [monitors],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...monitors]
      .sort((a, b) => a.order - b.order)
      .filter((m) => {
        if (filter === "active" && !m.enabled) return false;
        if (filter === "paused" && m.enabled) return false;
        if (filter === "favorites" && !m.favorite) return false;
        if (category && m.category !== category) return false;
        if (!q) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
  }, [monitors, query, filter, category]);

  const today = stats.at(-1);
  const totals = useMemo(
    () => ({
      knocks: monitors.reduce((a, m) => a + m.totalRequests, 0),
      errors: monitors.reduce((a, m) => a + m.errorCount, 0),
      active: monitors.filter((m) => m.enabled).length,
    }),
    [monitors],
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <AppShell
      title="Monitors"
      subtitle="We're not checking if it's alive — we're just knocking on the door."
      actions={
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => {
            forceRunAll();
            toast("Knocking on every door at once.");
          }}
        >
          <Zap className="size-3.5" /> Wake all
        </Button>
      }
    >
      {({ openEdit, openNew, hydrated }) => (
        <div className="mx-auto max-w-7xl space-y-6">
          {/* stats */}
          <section className="grid gap-4 lg:grid-cols-4">
            {[
              { label: "Active loops", value: totals.active, icon: Play },
              { label: "Total knocks", value: totals.knocks, icon: CheckCheck },
              { label: "Today", value: today?.requests ?? 0, icon: Activity },
              { label: "Network errors", value: totals.errors, icon: Pause },
            ].map((s) => (
              <div key={s.label} className="glass animate-rise rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <s.icon className="size-3.5" /> {s.label}
                </div>
                <p className="mt-2 font-display text-3xl font-bold">
                  {hydrated ? s.value : "–"}
                </p>
              </div>
            ))}
          </section>

{/* Hidden for now */}
          {/* <section className="glass animate-rise rounded-2xl p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Requests, last 14 days</h2>
              <span className="text-[11px] text-muted-foreground">
                Your free hosting plan called. It misses your traffic.
              </span>
            </div>
            <MiniChart data={stats} />
          </section> */}

          {/* controls */}
          <section className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search monitors, URLs, tags..."
                className="border-glass-border bg-glass pl-9"
              />
            </div>
            {(["all", "active", "paused", "favorites"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs capitalize transition-colors",
                  filter === f
                    ? "border-primary/60 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={cn(
                  "rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs transition-colors",
                  category === c
                    ? "border-primary/60 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </section>

          {selected.length > 0 && (
            <div className="glass animate-rise flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3">
              <span className="text-sm">
                {selected.length} selected
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => bulkEnable(true, selected)}
                >
                  Enable
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => bulkEnable(false, selected)}
                >
                  Disable
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* list */}
          {!hydrated ? (
            <div className="grid gap-3 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-shimmer h-28 rounded-2xl" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="glass animate-rise grid place-items-center rounded-3xl px-6 py-20 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="size-6" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">
                {monitors.length === 0 ? "Nothing to wake yet" : "No matches"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {monitors.length === 0
                  ? EMPTY_LINES.noMonitors
                  : EMPTY_LINES.noResults}
              </p>
              {monitors.length === 0 && (
                <Button className="mt-6" onClick={openNew}>
                  Create your first monitor
                </Button>
              )}
            </div>
          ) : (
            <div className={cn("grid gap-3", !compact && "xl:grid-cols-2")}>
              {list.map((m) => (
                <MonitorCard
                  key={m.id}
                  monitor={m}
                  compact={compact}
                  nextRun={nextRuns[m.id]}
                  selected={selected.includes(m.id)}
                  onSelect={toggleSelect}
                  onEdit={openEdit}
                  onDragStart={(id) => (dragId.current = id)}
                  onDrop={(id) => {
                    if (dragId.current && dragId.current !== id)
                      reorderMonitors(dragId.current, id);
                    dragId.current = null;
                  }}
                />
              ))}
            </div>
          )}

          <p className="pt-4 text-center text-xs text-muted-foreground">
            Tip: press <kbd className="font-mono">N</kbd> for a new monitor,{" "}
            <kbd className="font-mono">⌘K</kbd> for everything else.
          </p>
        </div>
      )}
    </AppShell>
  );
}
