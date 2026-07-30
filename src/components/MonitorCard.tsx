import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Play,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Timer,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { getIcon } from "@/components/icon-map";
import { cn } from "@/lib/utils";
import { formatCountdown, formatInterval, relative } from "@/lib/format";
import { createMonitor, removeMonitor, updateMonitor } from "@/lib/store";
import { pingMonitor } from "@/hooks/useWakeEngine";
import type { Monitor } from "@/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  monitor: Monitor;
  nextRun?: number;
  compact: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onEdit: (m: Monitor) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}

export function MonitorCard({
  monitor: m,
  nextRun,
  compact,
  selected,
  onSelect,
  onEdit,
  onDragStart,
  onDrop,
}: Props) {
  const [confirm, setConfirm] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const Icon = getIcon(m.icon);

  const actions = (
    <>
      <button
        type="button"
        onClick={() => onEdit(m)}
        className="hidden"
        aria-hidden
      />
    </>
  );

  const body = (
    <div
      draggable
      onDragStart={() => onDragStart(m.id)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(m.id);
      }}
      className={cn(
        "group glass glass-hover animate-rise relative overflow-hidden rounded-2xl p-4",
        compact ? "p-3" : "p-4",
        selected && "ring-1 ring-primary/60",
        dragOver && "border-primary/60",
        !m.enabled && "opacity-60",
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-15 blur-3xl transition-opacity group-hover:opacity-30"
        style={{ background: m.color }}
      />
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onSelect(m.id)}
          aria-label="Select monitor"
          className={cn(
            "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-glass-border transition-colors",
            selected && "border-primary/60",
          )}
          style={{ background: `color-mix(in oklab, ${m.color} 14%, transparent)` }}
        >
          <Icon className="size-4" style={{ color: m.color }} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{m.name}</h3>
            {m.favorite && (
              <Star className="size-3.5 fill-warning text-warning" />
            )}
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              <span className="font-mono text-[9px] text-muted-foreground/40 transition-opacity group-hover:text-muted-foreground/70">
                drag to rearrange
              </span>
              <Badge
                variant="outline"
                className="border-glass-border bg-glass font-mono text-[10px]"
              >
                {m.method}
              </Badge>
            </span>
          </div>
          {m.url ? (
            <a
              href={/^https?:\/\//i.test(m.url) ? m.url : `http://${m.url}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 inline-block max-w-full truncate font-mono text-[11px] text-muted-foreground hover:text-primary hover:underline"
            >
              {m.url}
            </a>
          ) : (
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              no url set
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={m.enabled ? m.lastStatus : "paused"} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              <Timer className="size-3" />
              {m.enabled && nextRun
                ? formatCountdown(nextRun - Date.now())
                : "—"}
              <span className="opacity-50">
                / {formatInterval(m.intervalSec)}
              </span>
            </span>
          </div>

          {!compact && (
            <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <span>
                <span className="font-mono text-foreground">
                  {m.totalRequests}
                </span>{" "}
                knocks · <span className="font-mono">{m.errorCount}</span> errors
                · {relative(m.lastRunAt)}
              </span>
              <span className="truncate rounded-md bg-secondary/60 px-2 py-0.5">
                {m.category}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Switch
            checked={m.enabled}
            onCheckedChange={(v) =>
              updateMonitor(m.id, {
                enabled: v,
                lastStatus: v ? "scheduled" : "paused",
              })
            }
            aria-label="Toggle monitor"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => pingMonitor(m.id, true)}>
                <Play className="size-4" /> Wake now
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onEdit(m)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  updateMonitor(m.id, { favorite: !m.favorite })
                }
              >
                <Star className="size-4" />
                {m.favorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  createMonitor({ ...m, name: `${m.name} (copy)` });
                  toast.success("Duplicated. Twice the knocking.");
                }}
              >
                <Copy className="size-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setConfirm(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {actions}
    </div>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{body}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onSelect={() => pingMonitor(m.id, true)}>
            <Play className="size-4" /> Wake now
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onEdit(m)}>
            <Pencil className="size-4" /> Edit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirm(true)}>
            <Trash2 className="size-4" /> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{m.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This monitor stops knocking forever. Its service will go back to
              sleep, undisturbed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeMonitor(m.id);
                toast("Deleted. One less door to knock on.");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
