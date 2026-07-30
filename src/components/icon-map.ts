import {
  Server,
  Database,
  Cloud,
  Bot,
  Globe,
  Rocket,
  Cpu,
  Boxes,
  Zap,
  Coffee,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Server,
  Database,
  Cloud,
  Bot,
  Globe,
  Rocket,
  Cpu,
  Boxes,
  Zap,
  Coffee,
};

export const ICON_KEYS = Object.keys(ICONS);

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Server;
}
