import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  exportJSON,
  importJSON,
  resetAll,
  updateSettings,
  useStore,
} from "@/lib/store";
import { requestNotificationPermission } from "@/lib/notify";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FPING" },
      {
        name: "description",
        content:
          "Tune FPING: humor level, browser notifications, sounds, compact layout and JSON backups. Everything stays in your browser.",
      },
      { property: "og:title", content: "Settings — FPING" },
      {
        property: "og:description",
        content: "Local-first preferences, backups and a big red reset button.",
      },
    ],
  }),
  component: SettingsPage,
});

function Row({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-glass-border py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fping-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded. Your knocks are immortal now.");
  };

  return (
    <AppShell
      title="Settings"
      subtitle="Everything lives in your browser. No cloud, no accounts, no regrets."
    >
      {() => (
        <div className="mx-auto max-w-2xl space-y-6">
          <section className="glass animate-rise rounded-2xl px-5 py-2">
            <Row
              title="Sarcastic microcopy"
              desc="Witty status lines instead of dull technical messages."
              checked={settings.humor}
              onChange={(v) => updateSettings({ humor: v })}
            />
            <Row
              title="Browser notifications"
              desc="Only fires on real network errors. No spam."
              checked={settings.notifications}
              onChange={async (v) => {
                if (v) {
                  const ok = await requestNotificationPermission();
                  if (!ok) {
                    toast.error("Permission denied. Silence it is.");
                    return;
                  }
                }
                updateSettings({ notifications: v });
              }}
            />
            <Row
              title="Notification sounds"
              desc="A soft blip each time a request is sent."
              checked={settings.sounds}
              onChange={(v) => updateSettings({ sounds: v })}
            />
            <Row
              title="Compact layout"
              desc="Single-column, denser monitor rows."
              checked={settings.compact}
              onChange={(v) => updateSettings({ compact: v })}
            />
          </section>

          <section className="glass animate-rise space-y-4 rounded-2xl p-5">
            <div>
              <h2 className="text-sm font-semibold">Activity log size</h2>
              <p className="text-xs text-muted-foreground">
                How many entries to keep before old knocks fade into history.
              </p>
            </div>
            <div className="grid max-w-40 gap-2">
              <Label htmlFor="limit" className="sr-only">
                Log limit
              </Label>
              <Input
                id="limit"
                type="number"
                min={20}
                max={5000}
                value={settings.logLimit}
                onChange={(e) =>
                  updateSettings({
                    logLimit: Math.max(20, Number(e.target.value) || 300),
                  })
                }
              />
            </div>
          </section>

          <section className="glass animate-rise space-y-4 rounded-2xl p-5">
            <div>
              <h2 className="text-sm font-semibold">Backups</h2>
              <p className="text-xs text-muted-foreground">
                Export your monitors as JSON, or restore from a previous life.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" className="gap-2" onClick={doExport}>
                <Download className="size-4" /> Export JSON
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" /> Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    importJSON(await file.text());
                    toast.success("Restored. The knocking resumes.");
                  } catch {
                    toast.error("That file made no sense to us.");
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </section>

          <section className="glass animate-rise space-y-4 rounded-2xl border-destructive/30 p-5">
            <div className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="size-4" />
              <h2 className="text-sm font-semibold">Danger zone</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Wipes every monitor, log and preference from this browser.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reset everything</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass">
                <AlertDialogHeader>
                  <AlertDialogTitle>Erase all local data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your services will finally get the rest they've been asking
                    for. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Never mind</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetAll();
                      toast("Clean slate. Suspiciously quiet.");
                    }}
                  >
                    Erase
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </div>
      )}
    </AppShell>
  );
}
