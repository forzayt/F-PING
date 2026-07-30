import type { DayStat } from "@/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SHOWN_DAYS = [1, 3, 5]; // Mon, Wed, Fri

// GitHub-style green shades: 0 = empty, 1–4 = increasing intensity
const LEVEL_COLORS = [
  "#161b22", // level 0 – no activity
  "#0e4429", // level 1
  "#006d32", // level 2
  "#26a641", // level 3
  "#39d353", // level 4
];

function getLevel(count: number, max: number): number {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

type Cell = { date: Date | null; stat: DayStat | null; dayIndex: number };

function buildGrid(data: DayStat[]): Cell[][] {
  const lookup = new Map(data.map((d) => [d.day, d]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start 52 weeks ago, snap to the nearest Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 52 * 7);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const totalDays =
    Math.ceil((today.getTime() - startDate.getTime()) / 86400000) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  return Array.from({ length: totalWeeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      if (date > today) return { date: null, stat: null, dayIndex: d };
      const key = date.toISOString().split("T")[0];
      return { date, stat: lookup.get(key) ?? null, dayIndex: d };
    })
  );
}

function buildMonthLabels(
  weeks: Cell[][]
): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.find((c) => c.date !== null);
    if (!first?.date) return;
    const m = first.date.getMonth();
    if (m !== lastMonth) {
      labels.push({
        label: first.date.toLocaleString("default", { month: "short" }),
        col: wi,
      });
      lastMonth = m;
    }
  });
  return labels;
}

const CELL = 11;
const GAP = 3;
const DAY_LABEL_W = 28;
const MONTH_LABEL_H = 18;
const LEGEND_H = 16;

export function MiniChart({ data }: { data: DayStat[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-24 place-items-center text-xs text-muted-foreground">
        No knocks recorded yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.requests), 1);
  const weeks = buildGrid(data);
  const monthLabels = buildMonthLabels(weeks);

  const totalW = DAY_LABEL_W + weeks.length * (CELL + GAP);
  const gridH = 7 * (CELL + GAP);
  const totalH = MONTH_LABEL_H + gridH + LEGEND_H + 4;

  return (
    <div className="w-full rounded-md" style={{ background: "#0d1117", padding: "10px 14px" }}>
      <svg
        width="100%"
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Activity contribution graph"
        style={{ display: "block" }}
      >
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={`m-${col}`}
            x={DAY_LABEL_W + col * (CELL + GAP)}
            y={MONTH_LABEL_H - 5}
            fontSize={10}
            fill="#7d8590"
            fontFamily="inherit"
          >
            {label}
          </text>
        ))}

        {/* Day-of-week labels */}
        {SHOWN_DAYS.map((di) => (
          <text
            key={`dl-${di}`}
            x={DAY_LABEL_W - 4}
            y={MONTH_LABEL_H + di * (CELL + GAP) + CELL - 1}
            fontSize={9}
            fill="#7d8590"
            textAnchor="end"
            fontFamily="inherit"
          >
            {DAY_LABELS[di]}
          </text>
        ))}

        {/* Grid cells */}
        {weeks.map((week, wi) =>
          week.map((cell, di) => {
            const x = DAY_LABEL_W + wi * (CELL + GAP);
            const y = MONTH_LABEL_H + di * (CELL + GAP);

            if (!cell.date) {
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={x} y={y}
                  width={CELL} height={CELL}
                  rx={2} ry={2}
                  fill="transparent"
                />
              );
            }

            const requests = cell.stat?.requests ?? 0;
            const level = getLevel(requests, max);
            const dateStr = cell.date.toISOString().split("T")[0];

            return (
              <rect
                key={`${wi}-${di}`}
                x={x} y={y}
                width={CELL} height={CELL}
                rx={2} ry={2}
                fill={LEVEL_COLORS[level]}
                stroke={level === 0 ? "#21262d" : "none"}
                strokeWidth={0.5}
              >
                <title>
                  {requests} request{requests !== 1 ? "s" : ""} on {dateStr}
                </title>
              </rect>
            );
          })
        )}

        {/* Legend */}
        <text
          x={DAY_LABEL_W}
          y={MONTH_LABEL_H + gridH + LEGEND_H}
          fontSize={9}
          fill="#7d8590"
          fontFamily="inherit"
        >
          Less
        </text>
        {LEVEL_COLORS.map((color, i) => (
          <rect
            key={`leg-${i}`}
            x={DAY_LABEL_W + 28 + i * (CELL + 2)}
            y={MONTH_LABEL_H + gridH + 4}
            width={CELL} height={CELL}
            rx={2} ry={2}
            fill={color}
            stroke={i === 0 ? "#21262d" : "none"}
            strokeWidth={0.5}
          />
        ))}
        <text
          x={DAY_LABEL_W + 28 + 5 * (CELL + 2) + 2}
          y={MONTH_LABEL_H + gridH + LEGEND_H}
          fontSize={9}
          fill="#7d8590"
          fontFamily="inherit"
        >
          More
        </text>
      </svg>
    </div>
  );
}
