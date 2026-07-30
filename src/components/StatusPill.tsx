import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/humor";
import type { MonitorStatus } from "@/types";

const TONE: Record<MonitorStatus, string> = {
  sent: "text-primary",
  scheduled: "text-chart-4",
  waiting: "text-warning",
  error: "text-destructive",
  paused: "text-muted-foreground",
  idle: "text-muted-foreground",
};

export function StatusPill({
  status,
  className,
}: {
  status: MonitorStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-2.5 py-1 text-[11px] font-medium tracking-wide",
        TONE[status],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full bg-current",
          (status === "waiting" || status === "sent") && "animate-pulse-ring",
        )}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
