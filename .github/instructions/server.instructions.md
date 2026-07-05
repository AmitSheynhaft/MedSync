---
applyTo: "server/**"
---

# MedSync Server — NestJS 9 + TypeORM + PostgreSQL (port 4000)

## Conventions

- Feature-module layout: each domain has `*.module.ts`, `*.controller.ts`, `*.service.ts`.
- Shared auth building blocks live under `server/src/common/`
  (`guards/`, `decorators/`, `authorization/`, `constants/`).

## Code organization & code craft

- **One responsibility per class.** Controller = HTTP routing/validation; service =
  business logic; entity = data shape. Don't put DB queries in controllers or HTTP
  concerns in services.
- **Split large services.** If a service grows past ~200 lines or mixes concerns
  (e.g. persistence + AI generation), extract a focused collaborator service and
  inject it — mirror how `document-summary`/`ocr` sit beside `documents`.
- **New domain → new module folder** with its own `*.module.ts`/`*.controller.ts`/
  `*.service.ts`; register it in `app.module.ts`. Don't bolt endpoints onto an
  unrelated feature module.
- **Share cross-cutting code via `common/`**, not by copy-paste. Guards, decorators,
  enums and helpers used by 2+ features belong under `server/src/common/`.
- **Small methods.** Extract private helpers for distinct steps (validate → build →
  persist) so `handleX` reads as a short sequence, e.g. a `doGenerateAndSave` split.
- **DTOs/types in their own files**, not inline in controllers. Keep entity relations
  and enums in `entities/`.

## Migrations

- Never edit or rewrite an already-applied migration. Always add a new migration file.
- Use `DROP … IF EXISTS` / guarded SQL so reruns are safe.
- Generate: `npm run migration:generate -- src/migrations/<Name>`
- Run: `npm run migration:run`

## Gemini / AI

- `@google/generative-ai` keyed by `GEMINI_API_KEY`. Treat the key as optional —
  code must degrade gracefully (skip AI generation) when it is missing.

## Commands (run from `server/`)

- Build: `npx nest build`
- Dev (watch): `npm run start:dev`
- Prod: `npm run start:prod`
- Kill the server before restarting:
  `Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

## Best practices

- **Thin controllers**: controllers validate/route only; put business logic in
  services. Inject dependencies via the constructor — no manual instantiation.
- **DTOs + validation**: define request DTOs and validate at the boundary
  (`class-validator`/pipes). Never pass raw `req.body` into services or the ORM.
- **Authorization**: enforce access on the server with the `common/guards` +
  `roles` decorators — the client role check is UX only, not a security boundary.
- **TypeORM safety**: use the repository/query-builder with parameters; never build
  SQL by string concatenation (SQL-injection risk). Scope queries by owner
  (patient/caregiver) so users can't read others' records.
- **Config**: read secrets/URLs from `@nestjs/config` env, never hardcode. Fail
  fast on missing required env; treat optional integrations (e.g. Gemini) as
  degradable.
- **Errors**: throw Nest `HttpException` subclasses (`NotFoundException`,
  `ForbiddenException`, …) rather than returning ad-hoc error shapes. Don't leak
  internal messages or stack traces to clients.
- **Async**: always `await` DB/AI calls and handle rejections; don't leave floating
  promises.
- **Verify**: run `npx nest build` before considering a change done.
