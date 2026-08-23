# Testing Strategy Lab

[![Quality Gate](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/quality-gate.yml)
[![Strategy Benchmark](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/benchmark.yml/badge.svg)](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/benchmark.yml)

An evidence-driven laboratory for comparing **testing strategies**, not just individual test layers.

This repository is Phase 2 of the experiment started in [`carlacazv/test-layer-lab`](https://github.com/carlacazv/test-layer-lab). Phase 1 isolates individual layers under controlled conditions. Phase 2 asks a different question:

> Which combination of static checks, unit, component, integration and browser E2E tests gives the best defect detection for its execution cost on a realistic application?

The methodology is inspired by the testing-strategy discussion in [web.dev — Test automation strategies](https://web.dev/articles/ta-strategies), including Pyramid, Diamond, Trophy and Crab-shaped approaches. The lab does **not** assume that any shape is universally correct.

## System under test

The benchmark uses the open-source **Conduit RealWorld** React frontend by TonyMckes:

- upstream: `TonyMckes/conduit-realworld-example-app`
- license: MIT
- pinned commit: `5e127d8569b300e0a21dc2c20ea680da4967b1aa`
- frontend: React 19 + Vite

The SUT is downloaded into `.sut/conduit` and is never committed here. The lab supplies a deterministic local RealWorld-compatible API on port `3001`; Vite proxies `/api` to it. This makes browser and integration experiments reproducible without making PostgreSQL availability part of the result.

The upstream dependency graph stays immutable: `npm ci` is executed against the pinned lockfile. Harness-only dependencies such as `jsdom`, Playwright and axe live in this repository rather than modifying the SUT.

## Layers

| Layer | Boundary | Command |
|---|---|---|
| Static | Production build / module graph | `npm run test:static` |
| Unit | Upstream helper tests | `npm run test:unit` |
| Component | Lab-injected React component tests | `npm run test:component` |
| Integration smoke | Small RealWorld HTTP contract set | `npm run test:integration:smoke` |
| Integration full | Full deterministic HTTP contract suite | `npm run test:integration` |
| Browser E2E | Real Chromium + Vite + deterministic API | `npm run test:e2e` |
| Accessibility | axe-core scan in the real browser | `npm run test:a11y` |

## Strategy arms

The benchmark defines representative arms rather than arbitrary percentages:

| Strategy | Included suites |
|---|---|
| Pyramid | static, unit, component, integration smoke, E2E smoke |
| Trophy | static, unit, component, full integration, E2E smoke |
| Diamond | static, component, full integration, E2E smoke |
| Crab | static, integration smoke, full E2E, accessibility |
| E2E-heavy | static, full E2E, accessibility |
| Full | every available suite |

These are explicit experimental arms, not claims that the names have one canonical percentage split.

## Reproducibility

```bash
npm install
npm run sut:prepare
npx playwright install chromium
npm run test:all
```

Run the strategy runtime benchmark:

```bash
npm run benchmark
```

Run the complete deterministic mutation panel:

```bash
npm run mutation
```

Run the small mutation gate used by pull requests:

```bash
npm run mutation:smoke
```

Generated evidence is written under `reports/`.

## Mutation methodology

The seven-mutant panel deliberately crosses independent boundaries:

| Mutant family | Example risk | Intended discriminating boundary |
|---|---|---|
| Unit | user-visible date formatting | Unit |
| Component | empty tag rendering | Component |
| Integration smoke | article count/pagination contract | Integration smoke |
| Integration full | invalid-auth status contract | Integration full |
| Browser E2E | home copy regression | E2E smoke |
| Browser journey | wrong post-login navigation | E2E auth |
| Accessibility | missing image text alternative | axe accessibility |

Frontend mutants are applied to the pinned SUT; API-contract mutants are applied to the deterministic lab API. Every selected layer executes independently against each mutant, and the original file is restored in a `finally` block. A layer kills a mutant only when its command actually fails.

The runner keeps `integrationSmoke` and `integrationFull` as separate observations. This matters because a Pyramid arm and a Trophy arm should not receive identical mutation credit merely because both contain something called “integration”.

## CI evidence

**Quality Gate** runs on branches and pull requests and proves:

- harness/meta tests;
- deterministic integration contracts;
- production frontend build;
- unit and component suites;
- full Playwright browser journeys;
- accessibility scan;
- representative mutation smoke across unit, integration-full and accessibility boundaries.

**Strategy Benchmark** runs after changes land on `main` (and can also be dispatched manually). It regenerates every strategy runtime plus the full mutation matrix, uploads raw evidence, and only then deploys the measured dashboard to GitHub Pages.

## Evidence dashboard

Measured dashboard:

`https://carlacazv.github.io/testing-strategy-lab/`

The dashboard reports runtime and detection separately, then derives mutation score and kills-per-second for comparison. Those metrics are evidence for this pinned SUT and mutant catalog, not universal rankings of testing strategies.

## Principles

- Runtime is not defect-detection evidence.
- Coverage percentage is not treated as confidence.
- A slow layer can still be essential if it uniquely guards a critical risk.
- A fast layer can still be low-value if it kills no meaningful mutants.
- Strategy selection should be based on marginal detection value, not geometry alone.
- Infrastructure nondeterminism must not be mistaken for test-strategy evidence.

## License

The lab code is MIT licensed. The upstream Conduit application remains under its own MIT license and is fetched at runtime; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
