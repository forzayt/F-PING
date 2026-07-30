import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { DayStat } from "@/types";

export function MiniChart({ data }: { data: DayStat[] }) {
  const series = data.slice(-14);
  if (series.length === 0) {
    return (
      <div className="grid h-24 place-items-center text-xs text-muted-foreground">
        No knocks recorded yet.
      </div>
    );
  }
  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="fpingArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" hide />
          <Tooltip
            cursor={{ stroke: "var(--color-border)" }}
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#fpingArea)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
