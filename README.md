# MUTMLSA — Murang'a University of Technology Medical Laboratory Students' Association

Frontend for the official MUTMLSA site. Built with **React**, **Tailwind CSS v4**
(via `@tailwindcss/vite`), and **Motion** for animation.

## Design direction

- **Palette**: lab-report paper base, a deep specimen green identity color,
  and a blood-tube coral accent. Full dark mode support, defaulting to dark
  for first-time visitors.
- **Type**: Fraunces (display/serif) for headings, Inter for body text,
  IBM Plex Mono for small "specimen label" details.
- **Signature motif**: sections styled like microscope slide labels —
  corner crosshair brackets, monospace eyebrows, drifting red/white blood
  cells (`AmbientField`, `creatures.jsx`) animated throughout the site,
  plus section-specific creatures (a swimming bacterium in Focus, a
  trypanosome in About).

## Navigation structure

The site uses a lightweight in-page tab system rather than a single long
scroll or full client-side routing:

- **Home** — Hero, About, Focus, Cohorts, Committee, Join, Newsletter
- **Archive** — Moments (photo archive by academic year/semester), Alumni
  (by graduating class), Current Students (by year, Y1–Y4)
- **Now** — Events, and the Games section (Bingo, Lab Quiz, Speed Round)

Tab state lives in `App.jsx` (`activeTab`), rendered via `TabBar.jsx`. The
Navbar (with anchor links + dark mode toggle) only shows on the Home tab.

## Key features

- **Join form** (`JoinForm.jsx`) — membership applications, submits to the
  backend, prevents duplicate submissions by email
- **Admin Portal** (`/admin`, `AdminPortal.jsx`) — password-gated internal
  tool for confirming applications into members, tracking one-time
  registration + per-semester payment status (grouped by Y1–Y4), viewing
  newsletter subscribers, and backfilling subscribers from existing
  members/applications
- **Chat widget** (`ChatWidget.jsx`) — FAQ assistant answering questions
  about MUTMLSA (meetings, fees, events, membership) plus general medical
  lab science questions, with lightweight campus-location lookup for
  "where is X" questions
- **Moments / Alumni / Current Students** — photo galleries with
  slideshows, a lightbox with hold-to-zoom, organized by academic
  year/semester or graduating class/current year
- **Newsletter** — email-only signup (no accounts), subscriber list
  managed via the admin portal, sent manually via Gmail BCC
- **Games** (`Now` tab):
  - **Bingo** — a 25-square "find someone who..." card with a live
    leaderboard, BINGO/Blackout detection and celebration popups, no
    login required (progress remembered via `localStorage`, with a
    name-based lookup for other devices)
  - **Lab Quiz** and **Speed Round** — additional engagement games (see
    their respective component files for details)

## Getting started

```bash
npm install
npm run dev
```

Requires a `.env` with:

VITE_API_URL=http://localhost:4000

(point this at the live backend URL once deployed)

## Structure

src/
components/
Navbar.jsx, TabBar.jsx, TopBar.jsx, Footer.jsx
Hero.jsx, About.jsx, Focus.jsx, Cohorts.jsx, Events.jsx
Committee.jsx, Join.jsx, JoinForm.jsx, Newsletter.jsx
Moments.jsx, Alumni.jsx, CurrentStudents.jsx
Bingo.jsx, [LabQuiz, SpeedRound — added separately]
AdminPortal.jsx
ChatWidget.jsx
AmbientField.jsx, creatures.jsx, Reveal.jsx, TiltCard.jsx, Counter.jsx
hooks/
useDarkMode.js
config/
api.js
App.jsx
index.css


## Deployment

Deployed on **Vercel**. A `vercel.json` rewrite rule routes all paths to
`index.html` so client-side routes (like `/admin`) work correctly.
