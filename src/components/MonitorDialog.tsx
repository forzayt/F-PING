import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_KEYS, getIcon } from "@/components/icon-map";
import { PALETTE, createMonitor, updateMonitor } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { HttpMethod, Monitor } from "@/types";
import { toast } from "sonner";

const INTERVALS = [
  { label: "30 seconds", value: 30 },
  { label: "1 minute", value: 60 },
  { label: "5 minutes", value: 300 },
  { label: "10 minutes", value: 600 },
  { label: "14 minutes", value: 840 },
  { label: "30 minutes", value: 1800 },
  { label: "1 hour", value: 3600 },
];

const blank = {
  name: "",
  url: "",
  icon: "Server",
  color: PALETTE[0],
  category: "General",
  tags: "",
  notes: "",
  method: "GET" as HttpMethod,
  intervalSec: 600,
  enabled: true,
  favorite: false,
};

export function MonitorDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Monitor | null;
}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? { ...editing, tags: editing.tags.join(", ") }
        : { ...blank },
    );
  }, [open, editing]);

  const submit = () => {
    if (!form.url.trim()) {
      toast.error("A monitor without a URL is just wishful thinking.");
      return;
    }
    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (editing) {
      updateMonitor(editing.id, payload);
      toast.success("Updated. Knocking resumes shortly.");
    } else {
      createMonitor(payload);
      toast.success("Monitor added. Let the polite harassment begin.");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit monitor" : "New monitor"}</DialogTitle>
          <DialogDescription>
            We don't check if it's alive — we just knock on the door.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              placeholder="My sleepy API"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={form.url}
              placeholder="https://my-app.onrender.com/health"
              className="font-mono text-xs"
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select
                value={form.method}
                onValueChange={(v) =>
                  setForm({ ...form, method: v as HttpMethod })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["GET", "HEAD", "POST"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Interval</Label>
              <Select
                value={String(form.intervalSec)}
                onValueChange={(v) =>
                  setForm({ ...form, intervalSec: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((i) => (
                    <SelectItem key={i.value} value={String(i.value)}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="cat">Category</Label>
              <Input
                id="cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                placeholder="api, render, side-project"
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_KEYS.map((key) => {
                const Ico = getIcon(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, icon: key })}
                    className={cn(
                      "grid size-9 place-items-center rounded-xl border border-glass-border bg-glass transition-colors",
                      form.icon === key && "border-primary/70 text-primary",
                    )}
                  >
                    <Ico className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  aria-label={`Color ${c}`}
                  className={cn(
                    "size-7 rounded-full border-2 transition-transform hover:scale-110",
                    form.color === c ? "border-foreground" : "border-transparent",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              value={form.notes}
              placeholder="Why does this thing keep falling asleep?"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-glass-border bg-glass px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Enabled</p>
              <p className="text-xs text-muted-foreground">
                Start knocking as soon as you save.
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{editing ? "Save changes" : "Create monitor"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
