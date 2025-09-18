Timetable Genius

A lightweight web app for creating, editing and viewing school timetables quickly and collaboratively.

## Features

- Create and edit timetables for divisions, teachers, and rooms
- Import/export timetables (CSV / printable formats)
- Role-based access control (admin, staff, viewer)
- Responsive UI with desktop + mobile layouts
- Supabase integration for auth and persistence

## Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Backend / DB: Supabase (Postgres)
- Utilities: Vite, Bun (lockfile present)

## Quickstart (Development)

1. Install dependencies

```pwsh
pnpm install
```

2. Create a `.env` file in the project root and set the Supabase variables (example names used in code):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the dev server

```pwsh
pnpm dev
```

4. Open `http://localhost:5173` in your browser.

## Database Migrations

Migration SQL files are stored under `supabase/migrations`. Use the Supabase CLI to apply them:

```pwsh
supabase db push
```

## Scripts

- `pnpm dev` — start local dev server
- `pnpm build` — build production bundle
- `pnpm preview` — preview production build

## Contributing

- Open an issue or PR with a clear description and related changes.
- Follow existing code style (TypeScript + Tailwind patterns).

## Notes & Next Steps

- Add screenshots or a demo link to this README for clarity.
- Consider adding automated tests and CI workflows.
- Add deployment instructions (Vercel / Netlify / Supabase Hosting).

---

If you want, I can add badges, screenshots, deployment instructions, or generate a short demo GIF — tell me which and I'll update the README.
