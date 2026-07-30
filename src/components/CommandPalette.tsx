import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Activity,
  LayoutGrid,
  Pause,
  Play,
  Plus,
  Settings,
  Zap,
} from "lucide-react";
import { bulkEnable, useStore } from "@/lib/store";
import { forceRunAll, pingMonitor } from "@/hooks/useWakeEngine";
import { toast } from "sonner";

export function CommandPalette({
  open,
  onOpenChange,
  onNew,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNew: () => void;
}) {
  const navigate = useNavigate();
  const monitors = useStore((s) => s.monitors);

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search monitors..." />
      <CommandList>
        <CommandEmpty>Nothing here. Even the search is napping.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(onNew)}>
            <Plus className="size-4" /> New monitor
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                forceRunAll();
                toast("Knocking on every door at once.");
              })
            }
          >
            <Zap className="size-4" /> Wake all now
          </CommandItem>
          <CommandItem onSelect={() => run(() => bulkEnable(true))}>
            <Play className="size-4" /> Enable all monitors
          </CommandItem>
          <CommandItem onSelect={() => run(() => bulkEnable(false))}>
            <Pause className="size-4" /> Disable all monitors
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(() => navigate({ to: "/" }))}>
            <LayoutGrid className="size-4" /> Monitors
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/activity" }))}>
            <Activity className="size-4" /> Activity log
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate({ to: "/settings" }))}>
            <Settings className="size-4" /> Settings
          </CommandItem>
        </CommandGroup>
        {monitors.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Wake a monitor">
              {monitors.slice(0, 40).map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${m.name} ${m.url}`}
                  onSelect={() => run(() => pingMonitor(m.id, true))}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: m.color }}
                  />
                  {m.name}
                  <span className="ml-auto truncate font-mono text-[11px] text-muted-foreground">
                    {m.url}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
