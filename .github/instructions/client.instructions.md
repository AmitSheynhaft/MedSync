---
applyTo: "client/**"
---

# MedSync Client — React 19 + Vite 6 + MUI 9 (RTL Hebrew)

## Conventions

- **Folder-per-component**: each page/component lives in its own folder with its
  colocated `styled.ts`, `hooks/`, `components/`, `constants.ts`, `utils.ts`.
  Example: `pages/VisitPage/{VisitPage.tsx, styled.ts, hooks/useVisitForm.ts, components/…}`.
- Styling is MUI: use `styled()` in `styled.ts` and the `sx` prop. No CSS modules for new work.
- **RTL note**: the UI is right-to-left. `justifyContent: 'flex-end'` renders **visually on the left**.
- Global font is **Heebo**, set via `typography.fontFamily` in `client/src/theme.ts`
  (the MUI theme overrides CSS `body`, so change the font there, not in CSS).

## Auth / roles

- Auth/roles live in `client/src/auth/` and `client/src/constants/roles.ts`.
- Use `getEffectiveRole()` from `auth/viewAs` and the `Role` enum for role checks.
- There is no `api/auth`/`loadSession` module — session lives in `auth/userDataSessionStore`.

## Component structure & code craft

- **Split by responsibility, not size alone.** A page composes small presentational
  child components; each renders one thing. If a component does layout **and** data
  **and** business rules, split it.
- **Rule of thumb: extract when a `.tsx` file passes ~150 lines** or when a chunk of
  JSX has its own state/handlers. Move it to `components/ChildName.tsx` in the same
  folder. Follow how `VisitPage` splits into `PatientInfoBar`, `VisitFormCard`, etc.
- **Logic goes in hooks, JSX stays in the component.** `useState`/`useEffect`/data
  loading/handlers belong in `hooks/useX.ts`; the component receives the returned
  object and just renders (`useVisitForm` → `VisitPage`).
- **Props over prop-drilling.** Pass a typed props object down one or two levels; if
  it goes deeper, lift the value into the page hook and pass what each child needs.
  Prefer small, explicit props to passing the whole `form` object where practical.
- **One component per file**, named to match the file. Colocate its `styled.ts`,
  `constants.ts`, `utils.ts` in the same folder — don't reach into another
  component's folder.
- **Pull constants and pure helpers out.** Magic strings/labels → `constants.ts`;
  pure functions (formatters, parsers, builders) → `utils.ts` so they're testable
  and reusable (e.g. `parseSummaryText`, `buildSummaryText`).
- **Styles live in `styled.ts`.** Use `styled()` for reusable structural elements
  and `sx` for one-off tweaks — don't inline large style objects in JSX.
- **Reuse shared components** from `client/src/components/` (e.g. `PageHeader`,
  `Toast`, `InfoGrid`) instead of re-implementing them per page.

## Commands (run from `client/`)

- Typecheck: `npx tsc --noEmit`
- Dev / build: `npm run dev`, `npm run build`

## Best practices

- **Data fetching**: use the `api/*` client modules — never call `fetch`/`axios`
  directly from components. Keep server calls out of render; run them in effects or
  event handlers.
- **State in hooks**: keep page state and side effects in a `hooks/useX.ts` hook;
  keep the component (`X.tsx`) focused on layout. This mirrors `useVisitForm`.
- **Guard async effects**: track an `active` flag (or AbortController) and skip
  `setState` after unmount to avoid races and warnings.
- **Re-entrancy**: guard actions that can be double-clicked (e.g. save) with a
  `useRef` flag, not just disabled state, so fast clicks can't fire twice.
- **Roles**: gate doctor-only UI and calls with `getEffectiveRole()`/`Role`; treat
  patients as read-only. Never trust the client alone — the server re-checks.
- **Typing**: no implicit `any` for props/state; type API payloads from the `api/*`
  return types. Run `npx tsc --noEmit` before considering a change done.
- **RTL**: prefer logical CSS (`marginInlineStart`, `borderInlineStart`) over
  left/right so layouts stay correct in RTL.
- **Secrets**: never hardcode tokens/keys in client code; anything shipped to the
  browser is public.
