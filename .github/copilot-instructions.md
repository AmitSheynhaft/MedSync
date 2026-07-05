# MedSync — Copilot Instructions

MedSync is a medical-visit management app. Two packages in one repo:

- `server/` — NestJS 9 + TypeORM + PostgreSQL. Runs on port **4000**.
- `client/` — React 19 + Vite 6 + MUI 9. **RTL Hebrew UI.**

## Environment & shell

- Dev OS is **Windows / PowerShell 5.1**.
  - Never use `&&` to chain commands. Use `;` or separate commands.
  - Change directory with `Push-Location` / `Pop-Location`, not `cd &&`.
  - Kill the server before restarting: `Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
- Run client and server commands from their own package folders (`client/`, `server/`).

## Verify changes

- Client typecheck: `npx tsc --noEmit` (from `client/`).
- Server build: `npx nest build` (from `server/`).
- Prefer these quick checks over starting the full dev servers.

## Client conventions (`client/`)

- **Folder-per-component**: each page/component lives in its own folder with its
  colocated `styled.ts`, `hooks/`, `components/`, `constants.ts`, `utils.ts`.
  Example: `pages/VisitPage/{VisitPage.tsx, styled.ts, hooks/useVisitForm.ts, components/…}`.
- Styling is MUI: use `styled()` in `styled.ts` and the `sx` prop. No CSS modules for new work.
- **RTL note**: the UI is right-to-left. `justifyContent: 'flex-end'` renders **visually on the left**.
- Global font is **Heebo**, set via `typography.fontFamily` in `client/src/theme.ts`
  (the MUI theme overrides CSS `body`, so change the font there, not in CSS).
- **Auth/roles** live in `client/src/auth/` and `client/src/constants/roles.ts`.
  Use `getEffectiveRole()` from `auth/viewAs` and the `Role` enum for role checks.
  There is no `api/auth`/`loadSession` module — session lives in `auth/userDataSessionStore`.
- Vite scripts: `npm run dev`, `npm run build`.

## Server conventions (`server/`)

- Feature-module layout: each domain has `*.module.ts`, `*.controller.ts`, `*.service.ts`.
- Shared auth building blocks live under `server/src/common/`
  (`guards/`, `decorators/`, `authorization/`, `constants/`).
- **Migrations**: never edit or rewrite an already-applied migration. Always add a
  new migration file. Use `DROP … IF EXISTS` / guarded SQL so reruns are safe.
  - Generate: `npm run migration:generate -- src/migrations/<Name>`
  - Run: `npm run migration:run`
- **Gemini / AI**: `@google/generative-ai` keyed by `GEMINI_API_KEY`. Treat the key as
  optional — code must degrade gracefully (skip AI generation) when it is missing.
- Nest scripts: `npm run start:dev` (watch), `npm run build`, `npm run start:prod`.

## General

- Match existing code style; keep changes minimal and scoped to the request.
- Do not add auth guards, comments, or abstractions that weren't requested.
- When resolving merge conflicts, confirm the intended feature direction before
  discarding a side, then clean up now-unused imports.

## Best practices

- **Verify before done**: typecheck/build the affected package (`npx tsc --noEmit`
  for client, `npx nest build` for server) before calling a change complete.
- **Small, scoped changes**: touch only what the task needs; don't refactor or
  rename unrelated code in passing.
- **Security**: validate at trust boundaries, parameterize DB queries, never
  hardcode secrets, and keep authorization on the server.
- **Git**: don't force-push, hard-reset shared branches, or use `--no-verify`.
  Confirm before any destructive or irreversible action.
- **Errors**: diagnose and fix root causes rather than retrying the same failing
  command or masking symptoms.

