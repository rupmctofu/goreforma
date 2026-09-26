# Feature: analytics-ga4

Goal: ship the GA4 analytics rewrite (structured event contract + UTM attribution +
server-side emission) plus the adjacent product changes accumulated in the working tree.

Status: committed.

## Tasks

- [x] 1. Verify the full working-tree diff (typecheck, lint, tests, build)
- [x] 2. Review findings and fix blockers
- [x] 3. Commit the work unit

## Findings from verification

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| H1 | medium | `lib/attribution.ts` trusted entries with a missing/non-finite `captured_at` forever (`NaN > TTL` is `false`) | **Fixed.** Finite-number guard evicts the key. TDD: RED 2 failed -> GREEN 38 passed; full suite 66 -> 72 tests |
| H2 | medium | `view_context: "recovery"` in the lead funnel is dead code | **Intentional.** The recovery view delivers a saved result; it does not collect leads. No change |
| H3 | medium | `build` no longer runs `prisma migrate deploy` | **Intentional.** Documented in README: migrations run as a separate pre-deploy step (`npm run db:deploy`) |

Also noted, not fixed (pre-existing design, not regressions):
- `x-forwarded-for` is trusted verbatim for rate limiting; forgeable, so the limiter is bypassable.
- The `user-agent` fallback key has unbounded cardinality.
- `error_type` / `field` / `page_type` are open `string` taxonomies; a typo ships silently.
- `AnalyticsProps` does not constrain the `first_*` / `last_*` keys spread from `getAttributionProperties()`.

## Validation

`npm run typecheck` clean, `npm run lint` clean, `npm test` 72 passed (4 files),
`npm run build` succeeded (15 routes).

## Commits

- `<hash>` feat: GA4 analytics contract, UTM attribution and lead funnel tracking

## Notes

- Base: `3b3e2e2 feat: mejorar calculadora y experiencia de estimación`
- Work landed directly on `main` (user decision: keep on main, no feature branch)
- Engram memory provider is down (binary predates v2.0.0-rc.11), so the `odd/analytics-ga4/tasks`
  mirror could not be written.
