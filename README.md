# Service Whisperer

Build a modern, frontend-only uptime dashboard with name "FPING"  that acts as a personal "service awakener" rather than a traditional uptime monitor. The application should be built with React + Vite + TypeScript, styled using Tailwind CSS, shadcn/ui components, and enhanced with animations and interactive UI from React Bits. The entire experience must follow a premium glassmorphism-inspired dark theme with subtle gradients, smooth micro-interactions, soft shadows, animated status indicators, elegant loading skeletons, rounded cards, beautiful typography, and a polished desktop-first layout that feels comparable to Linear, Vercel, Raycast, or Arc Browser. Every piece of data—including monitor configurations, settings, history, themes, and preferences—must live entirely inside LocalStorage (or IndexedDB if necessary), with absolutely no backend, authentication, database, or cloud dependency.

The purpose of the application is simple: keep self-hosted or free-tier services awake while the dashboard tab is open. Users can create unlimited monitors, each with a custom URL, name, icon, color, category, interval, HTTP method, enabled/disabled state, notes, and optional tags. The monitor engine should automatically schedule independent timers for every URL and send requests using fetch() with mode: "no-cors" so that even if the browser cannot inspect the response because of CORS, the request still reaches the hosting platform and wakes the sleeping service. Since this is intentionally wake-only monitoring, never display fake "online" or "offline" states based on opaque responses. Instead, clearly indicate "Wake Request Sent", "Request Scheduled", "Waiting...", or "Network Error" only when an actual fetch exception occurs. The application should be lightweight enough to comfortably manage hundreds of monitors simultaneously.

The dashboard should feature a responsive sidebar, searchable monitor list, filter chips, categories, favorites, quick actions, drag-and-drop ordering, bulk enable/disable, keyboard shortcuts, beautiful settings pages, import/export JSON backups, browser notifications, optional notification sounds, live countdown timers until the next request, activity logs, request counters, daily statistics, and small animated charts. Include subtle empty states and humorous microcopy throughout the interface. Instead of boring technical messages, use witty and slightly sarcastic lines such as: "Still asleep... let's poke it again.", "Congratulations, another request has bravely sacrificed itself to CORS.", "We're not checking if it's alive—we're just knocking on the door.", "Your free hosting plan called. It misses your traffic.", "If this dashboard is closed, your servers are officially on their own.", and "Wake up, little service. Your users have expectations." Keep the humor tasteful and optional without becoming distracting.

Prioritize maintainable architecture with reusable components, custom hooks, proper state management, modular folders, and clean TypeScript types. The UI should feel exceptionally smooth, modern, and satisfying to use, with tasteful animations, floating action buttons, command palette support, contextual menus, confirmation dialogs, and polished transitions throughout. The final product should resemble a commercial-quality SaaS application despite being completely local-first and frontend-only, delivering a fast, beautiful, and enjoyable experience for developers who simply want one elegant dashboard to keep all their sleeping services awake while the page remains open.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/62fd118b-c147-443c-b9d3-ad8b44cbe807).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
