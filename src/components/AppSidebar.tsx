import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  LayoutGrid,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeft,
  GitCommit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Monitors", icon: LayoutGrid },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/commits", label: "Commit Logs", icon: GitCommit },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const total = useStore((s) => s.monitors.length);
  const active = useStore((s) => s.monitors.filter((m) => m.enabled).length);
  const knocks = useStore((s) =>
    s.monitors.reduce((a, m) => a + m.totalRequests, 0),
  );

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-glass-border bg-sidebar/60 backdrop-blur-xl transition-[width] duration-300 md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Zap className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-lg leading-none font-bold tracking-tight">
              FPING
            </p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              service awakener
            </p>
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV.map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-6 px-3">
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
      )}

      <div className="mt-auto p-3">
        {!collapsed && (
          <p className="mb-3 px-1 text-[11px] leading-relaxed text-muted-foreground">
            If this dashboard is closed, your servers are officially on their
            own.
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-start text-muted-foreground"
        >
          {collapsed ? (
            <PanelLeft className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" /> Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}


