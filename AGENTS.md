# Repository Guidelines

## Project Structure & Modules
- Next.js app root at `app/` with `page.tsx` as the main dashboard and `layout.tsx` for global providers.
- Shared UI lives in `components/` (e.g., `StatusGrid.tsx`, `MonitorCard.tsx`, `SettingsModal.tsx`); business data types and mocks live in `lib/`.
- Static assets are under `public/images/`; adjust paths as `/images/<name>.png` in JSX.
- Global styling resides in `app/globals.css`; prefer component-level classNames rather than inline styles for reusable patterns.

## Build, Test, and Development
- Install dependencies: `npm install`.
- Run the app locally: `npm run dev` (default at http://localhost:3000).
- Type check: `npm run type-check`.
- Lint: `npm run lint`.
- Production build (CI parity): `npm run build`.

## Coding Style & Naming
- Use TypeScript for all components; prefer functional components with hooks.
- Follow existing class naming (`kebab-case`) and keep layout semantics aligned with current CSS grid system (`content-grid`, `metrics-grid`).
- Keep props typed via interfaces in `lib/types.ts`; avoid `any`.
- Assets: reference via `/images/...`; do not hardcode absolute disk paths.

## Testing Guidelines
- Use `npm run type-check` and `npm run lint` before PRs.
- UI logic is primarily deterministic mock data; add unit coverage if you introduce pure helpers.
- For visual changes, add a short note or screenshot in the PR description.

## Commit & Pull Request Guidelines
- Commit messages: use concise imperative phrases (e.g., `chore: bump deps`, `feat: tweak status grid`).
- PRs should include: summary of changes, testing notes (commands run), and any known limitations.
- Link related issues/requirements; include screenshots/gifs for UI updates when feasible.

## Security & Configuration Tips
- Do not commit secrets or real endpoints; mock data is defined in `lib/mockData.ts`.
- Environment-specific settings belong in `.env.local` (not committed). Use placeholders in code and document expected keys.
