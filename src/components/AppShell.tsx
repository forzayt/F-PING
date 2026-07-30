import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Plus, Search, Star, Zap } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { MonitorDialog } from "@/components/MonitorDialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHydrated } from "@/hooks/useHydrated";
import { useWakeEngine } from "@/hooks/useWakeEngine";
import { useStore } from "@/lib/store";
import type { Monitor } from "@/types";

interface ShellCtx {
  openNew: () => void;
  openEdit: (m: Monitor) => void;
  hydrated: boolean;
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: (ctx: ShellCtx) => ReactNode;
}) {
  const hydrated = useHydrated();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Monitor | null>(null);
  const enabled = useStore((s) => s.monitors.filter((m) => m.enabled).length);

  useWakeEngine();

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (m: Monitor) => {
    setEditing(m);
    setDialogOpen(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (!typing && e.key === "n") {
        e.preventDefault();
        openNew();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="aurora-bg min-h-screen">
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-glass-border bg-background/60 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3.5 md:px-8">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-sidebar p-4">
                  <Link to="/" className="font-display text-lg font-bold">
                    FPING
                  </Link>
                  <nav className="mt-6 flex flex-col gap-1 text-sm">
                    <Link to="/" className="rounded-lg px-3 py-2 hover:bg-sidebar-accent">
                      Monitors
                    </Link>
                    <Link
                      to="/activity"
                      className="rounded-lg px-3 py-2 hover:bg-sidebar-accent"
                    >
                      Activity
                    </Link>
                    <Link
                      to="/commits"
                      className="rounded-lg px-3 py-2 hover:bg-sidebar-accent"
                    >
                      Commit Logs
                    </Link>
                    <Link
                      to="/settings"
                      className="rounded-lg px-3 py-2 hover:bg-sidebar-accent"
                    >
                      Settings
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold">{title}</h1>
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1.5 text-[11px] text-muted-foreground lg:inline-flex">
                  <Zap className="size-3 animate-pulse-ring text-primary" />
                  {enabled} awake loops running
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaletteOpen(true)}
                  className="gap-2 border-glass-border bg-glass text-muted-foreground"
                >
                  <Search className="size-3.5" />
                  <span className="hidden sm:inline">Search</span>
                  <kbd className="hidden rounded border border-glass-border px-1.5 font-mono text-[10px] sm:inline">
                    ⌘K
                  </kbd>
                </Button>
                <a
                  href="https://github.com/forzayt/F-PING"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-glass-border bg-glass px-3 py-1.5 text-xs font-medium text-foreground hover:bg-sidebar-accent hover:text-primary transition-colors"
                >
                  <Star className="size-3.5 text-amber-400 fill-amber-400/20" />
                  <span className="hidden sm:inline">Star on GitHub</span>
                  <span className="sm:hidden">Star</span>
                </a>
                {actions}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pt-6 pb-28 md:px-8">
            {children({ openNew, openEdit, hydrated })}
          </main>
        </div>
      </div>

      <Button
        onClick={openNew}
        size="lg"
        className="fixed right-6 bottom-6 z-40 gap-2 rounded-full shadow-[var(--shadow-glow)]"
      >
        <Plus className="size-4" /> New monitor
      </Button>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onNew={openNew}
      />
      <MonitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </div>
  );
}
