import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  LayoutGrid,
  Settings,
  Zap,
  GitCommit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Monitors", icon: LayoutGrid },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/commits", label: "Commit Logs", icon: GitCommit },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const [hovered, setHovered] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const total = useStore((s) => s.monitors.length);
  const active = useStore((s) => s.monitors.filter((m) => m.enabled).length);
  const knocks = useStore((s) =>
    s.monitors.reduce((a, m) => a + m.totalRequests, 0),
  );

  return (
    <>
      {/* Spacer to preserve layout width for collapsed state */}
      <div className="hidden w-[72px] shrink-0 md:block" />

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "fixed top-0 left-0 z-40 hidden h-screen flex-col border-r border-glass-border bg-sidebar/95 backdrop-blur-xl transition-[width,box-shadow] duration-300 ease-in-out md:flex overflow-hidden",
          hovered ? "w-64 shadow-2xl shadow-black/50" : "w-[72px]",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Zap className="size-4" />
          </div>
          <div
            className={cn(
              "min-w-0 transition-opacity duration-200",
              hovered ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <p className="font-display text-lg leading-none font-bold tracking-tight">
              FPING
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              service awakener
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span
                  className={cn(
                    "transition-opacity duration-200",
                    hovered ? "opacity-100" : "opacity-0 pointer-events-none",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-6 px-3 transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <div className="glass rounded-2xl p-3">
            <p className="text-[11px] tracking-widest text-muted-foreground uppercase">
              This session
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              {[
                ["Monitors", total],
                ["Active", active],
                ["Total knocks", knocks],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-auto p-3">
          <p
            className={cn(
              "px-1 text-[11px] leading-relaxed text-muted-foreground transition-opacity duration-200",
              hovered ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            If this dashboard is closed, your servers are officially on their
            own.
          </p>
        </div>
      </aside>
    </>
  );
}


