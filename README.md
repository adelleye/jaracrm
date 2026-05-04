# Jara CRM

Jara CRM is a lean WhatsApp-led sales follow-up CRM prototype for Nigerian B2B sales teams.

The product idea is simple: no active lead should exist without a next action. The app helps a sales team see what needs attention today, update lead activity, move deals through a stage board, and understand basic sales numbers without needing a backend.

## What It Does

- Shows a daily command center for overdue follow-ups, due-today actions, quiet leads, stale proposals, and hot leads with no next action.
- Lists all leads in a searchable table.
- Provides a draggable Kanban stage board for moving leads through the pipeline.
- Lets users create new leads with a required first follow-up.
- Lets users log WhatsApp messages, calls, meetings, proposals, payments, and other interactions.
- Updates lead `lastTouchDate`, `nextAction`, and `nextActionDate` when a log entry is saved.
- Shows simple sales metrics such as conversion rate, pipeline required, CAC, and CAC payback.
- Stores demo data locally in the browser using `localStorage`.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- React local state and `localStorage`
- No backend
- No auth
- No external APIs
- No paid AI calls

## Main Routes

- `/` - Today
- `/leads` - lead table and stage board
- `/leads/new` - create a lead
- `/leads/[id]` - lead detail and timeline
- `/log` - log a sales update
- `/numbers` - sales metrics

## Product Notes

This is an MVP prototype, so the data model is intentionally local and lightweight. It is designed for demoing the workflow and product direction, not for production customer data.

Location is intentionally static as Lagos. Making location dynamic would require browser geolocation permission or a third-party location service, which is unnecessary for this prototype.

Dates use the browser's local date, so the Today view and due/overdue logic update without any API.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Checks

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

