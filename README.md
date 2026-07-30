<div align="center">

<br />

# ⚡ FPING

### *"We're not checking if it's alive — we're just knocking on the door."*

**A premium, frontend-only service awakener dashboard.**  
Keep your sleeping self-hosted & free-tier services alive — beautifully.

<br />

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38BDF8)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Zero Backend](https://img.shields.io/badge/Zero_Backend-FF6B6B?style=for-the-badge&logo=databricks&logoColor=white)](/)
[![LocalStorage](https://img.shields.io/badge/100%25_Local-4CAF50?style=for-the-badge&logo=googledrive&logoColor=white)](/)

<br />

> **Built with [Lovable](https://lovable.dev)** · Continue developing in the [Lovable editor](https://lovable.dev/projects/62fd118b-c147-443c-b9d3-ad8b44cbe807)

<br />

---

</div>

## 🌙 What is FPING?

FPING is a **premium, local-first uptime dashboard** with one elegant mission: **keep your sleeping services awake**. It's not a traditional uptime monitor — it's a *service awakener*.

Free-tier hosting platforms (Render, Railway, Fly.io, etc.) spin down services after inactivity. FPING silently fires scheduled HTTP wake requests in the background while the tab is open, ensuring your services never go cold.

No backend. No auth. No cloud. Just your browser, your services, and a very polished dashboard.

---

## ✨ Features

### 🎯 Wake Engine
- **Independent timers** per monitor — each runs on its own schedule
- Uses `fetch()` with **`mode: "no-cors"`** so requests reach the server even without CORS headers
- Supports `GET`, `HEAD`, and `POST` HTTP methods
- Minimum 5-second interval guard to prevent abuse
- **Honest status reporting** — no fake "online/offline" states; only `Sent`, `Scheduled`, `Waiting`, or `Network Error`

### 📊 Dashboard
- **Searchable monitor list** with filter chips and categories
- **Favorites** — pin your most critical services to the top
- **Drag-and-drop ordering** for full control over your layout
- **Bulk enable/disable** across selected monitors
- **Live countdown timers** until the next wake request fires
- **Mini animated charts** — sparklines for per-monitor request history
- **Daily statistics** — requests vs. errors per day

### 🗂️ Monitor Configuration
Every monitor supports:
| Field | Description |
|---|---|
| `name` | Human-friendly label |
| `url` | Full URL to wake |
| `icon` | Custom icon picker |
| `color` | Accent color per monitor |
| `category` | Group monitors logically |
| `tags` | Flexible multi-tag labeling |
| `notes` | Private notes per service |
| `method` | `GET` / `HEAD` / `POST` |
| `intervalSec` | Wake interval in seconds |
| `enabled` | Toggle on/off without deleting |
| `favorite` | Pin to top of list |

### 🔔 Notifications & Sound
- **Browser push notifications** for network errors
- **Optional audio blips** — distinct sounds for success (`ok`) and failure (`error`)
- All notification preferences are fully togglable in Settings

### 📋 Activity Log
- Full timestamped log of every wake request and error
- Humorous microcopy on each entry *(optional — toggle in Settings)*
- Configurable log size limit to avoid bloat

### ⚙️ Settings & Personalization
- **Accent color** theming
- **Compact mode** for information-dense layouts
- Toggle **humor mode** on/off (yes, the witty lines are optional)
- **Notification & sound** preferences

### 💾 Data & Portability
- **100% local** — all data lives in `localStorage`
- **Import / Export JSON** backups — take your monitors anywhere
- Counters and status persist across page reloads
- No accounts, no cloud sync, no privacy concerns

### ⌨️ Power User Features
- **Command palette** — `⌘K` / `Ctrl+K` for instant actions
- **Keyboard shortcuts** throughout the UI
- **Contextual right-click menus** on monitor cards
- **Confirmation dialogs** for destructive actions

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── AppShell.tsx          # Root layout with sidebar & main content
│   ├── AppSidebar.tsx        # Navigation sidebar with categories & favorites
│   ├── MonitorCard.tsx       # Individual monitor card with status, countdown & mini chart
│   ├── MonitorDialog.tsx     # Create / edit monitor form
│   ├── CommandPalette.tsx    # ⌘K command palette
│   ├── MiniChart.tsx         # Sparkline chart component
│   ├── StatusPill.tsx        # Animated status badge
│   └── icon-map.ts           # Icon name → component mapping
│
├── hooks/
│   ├── useWakeEngine.ts      # Core scheduling engine & ping logic
│   ├── useHydrated.ts        # SSR-safe localStorage hydration
│   └── use-mobile.tsx        # Responsive breakpoint detection
│
├── routes/
│   ├── index.tsx             # Main dashboard view
│   ├── activity.tsx          # Activity log page
│   └── settings.tsx          # Settings & preferences page
│
├── lib/
│   ├── store.ts              # Global state (localStorage-backed)
│   ├── notify.ts             # Browser notifications & audio blips
│   └── humor.ts              # Witty microcopy lines
│
└── types/
    └── index.ts              # TypeScript interfaces (Monitor, LogEntry, etc.)
```

**State Management**: Custom pub/sub store backed by `localStorage` — no Redux, no Zustand, just clean TypeScript.

**Routing**: [TanStack Router](https://tanstack.com/router) with file-based route generation.

**UI**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) primitives + [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/) icons.

**Charts**: [Recharts](https://recharts.org/) for daily statistics, custom sparklines for monitor cards.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) — or [install via nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or [bun](https://bun.sh/)

### Local Development

```sh
# 1. Clone the repository
git clone <this-repository-url>
cd F-PING

# 2. Install dependencies
npm install
# or with bun
bun install

# 3. Start the development server
npm run dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## 🎭 The Humor

FPING ships with optional witty microcopy throughout the interface. When humor mode is on, you'll encounter lines like:

> *"Still asleep... let's poke it again."*

> *"Congratulations, another request has bravely sacrificed itself to CORS."*

> *"Your free hosting plan called. It misses your traffic."*

> *"If this dashboard is closed, your servers are officially on their own."*

> *"Wake up, little service. Your users have expectations."*

Don't worry — it's tasteful. You can turn it off in **Settings → Humor Mode**.

---

## 🔒 Privacy & Security

FPING is designed with privacy as a first principle:

- ✅ **Zero backend** — no server ever sees your monitor list or URLs
- ✅ **Zero analytics** — no tracking, no telemetry
- ✅ **Zero accounts** — no sign-up, no login, no email required
- ✅ **Runs entirely in your browser** — close the tab, everything stops
- ✅ **Export/import JSON** — your data stays yours, always

---

## 🛠️ Built With Lovable

This project was built with **[Lovable](https://lovable.dev)** — an AI-powered full-stack development platform.

- **Ship faster** — describe what you want to build and Lovable handles the code
- **Stay in sync** — every change made in Lovable is committed straight to this repository
- **Full ownership** — this code is yours; push to `main` on GitHub and your changes sync back into Lovable

👉 Continue developing in the [Lovable editor](https://lovable.dev/projects/62fd118b-c147-443c-b9d3-ad8b44cbe807)

---

## 📄 License

This project is open source. Do what you want with it — just don't let your services sleep.

---

<div align="center">

**FPING** — *"Your free hosting plan called. It misses your traffic."*

Made with ☕ and a deep hatred of cold-start latency.

</div>
