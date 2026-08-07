# Changelog

All notable changes to this project are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-08-07

### Fixed

- The component now carries its own dark surface instead of relying on the
  embedding page to provide one. The score readout sits in a header above the
  board, so on a light host it was accent green on white at 2.09:1, well under
  the 4.5:1 WCAG AA minimum. It now sits on the game's own background, and the
  component looks the same on any host.

## [0.1.0] - 2026-06-04

### Added

- Initial release of Anoraconda — an embeddable React + TypeScript snake game.
- `<Anoraconda />` component: a responsive grid board with a snake steered by
  the arrow keys or WASD; eat apples to grow and score, with a start / game-over
  overlay. Lose by hitting a wall or yourself; win by filling the board.
- `useAnoraconda()` hook owning the whole game as a single pure reducer —
  StrictMode-safe and correct when several ticks fire between renders — with a
  per-tick turn lock that stops a quick double-tap from reversing into the neck.
- Framework-free types and a Vitest + React Testing Library suite, including a
  StrictMode regression test for the reducer and a deterministic eat-and-grow
  test.
- Vite library build emitting ESM + bundled type declarations, with `react` and
  `react-dom` kept external as peer dependencies.
- ESLint + Prettier with no-type-assertion and no-non-null-assertion rules, and
  a CI workflow (lint, format, typecheck, test, build) on Node 20.x / 22.x.
- Trusted Publishing release pipeline (GitHub Release → OIDC publish with
  provenance), idempotent so a release for an already-published version is a
  no-op instead of a failure.

[0.1.1]: https://www.npmjs.com/package/@norarcasey/anoraconda/v/0.1.1
[0.1.0]: https://www.npmjs.com/package/@norarcasey/anoraconda/v/0.1.0
