import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/StatusPill";
import { clearLogs, useStore } from "@/lib/store";
import { EMPTY_LINES } from "@/lib/humor";
import { formatTime } from "@/lib/format";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity log — FPING" },
      {
        name: "description",
        content:
          "Every wake request FPING has sent, with timestamps, status and the occasional sarcastic remark.",
      },
      { property: "og:title", content: "Activity log — FPING" },
      {
        property: "og:description",
        content: "A running history of every knock on every sleepy door.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const logs = useStore((s) => s.logs);

  return (
    <AppShell
      title="Activity"
      subtitle="A running history of knocks, sacrifices and CORS mysteries."
      actions={
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => clearLogs()}
        >
          <Trash2 className="size-3.5" /> Clear
        </Button>
      }
    >
      {({ hydrated }) => (
        <div className="mx-auto max-w-4xl">
          {!hydrated ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="skeleton-shimmer h-14 rounded-xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="glass grid place-items-center rounded-3xl px-6 py-20 text-center">
              <h3 className="font-display text-xl font-semibold">All quiet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {EMPTY_LINES.noLogs}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li
                  key={l.id}
                  className="glass animate-rise flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatTime(l.at)}
                  </span>
                  <span className="w-40 shrink-0 truncate text-sm font-medium">
                    {l.monitorName}
                  </span>
                  <StatusPill status={l.status} className="shrink-0" />
                  <span className="truncate text-xs text-muted-foreground">
                    {l.message}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </AppShell>
  );
}
