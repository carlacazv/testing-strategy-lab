# Testing Strategy Lab

[![Quality Gate](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/quality-gate.yml)
[![Strategy Benchmark](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/benchmark.yml/badge.svg)](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/benchmark.yml)
[![Pages](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/pages.yml/badge.svg)](https://github.com/carlacazv/testing-strategy-lab/actions/workflows/pages.yml)

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

## Layers

| Layer | Boundary | Command |
|---|---|---|
| Static | Production build / module graph | `npm run test:static` |
| Unit | Upstream helper tests | `npm run test:unit` |
| Component | Lab-injected React component tests | `npm run test:component` |
| Integration | RealWorld HTTP contract against deterministic API | `npm run test:integration` |
| Browser E2E | Real Chromium + Vite + deterministic API | `npm run test:e2e` |
| Accessibility | axe-core scan in the real browser | `npm run test:a11y` |

## Strategy arms

The benchmark currently defines representative arms rather than arbitrary percentages:

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

Run deterministic frontend mutation experiments:

```bash
npm run mutation
```

Generated evidence is written under `reports/`.

## Mutation methodology

The initial mutation panel deliberately crosses layer boundaries:

- date formatting defect — expected to be guarded by unit tests;
- empty tag rendering defect — expected to be guarded by component tests;
- home-page copy regression — expected to be guarded by browser tests;
- post-login navigation defect — expected to be guarded by browser journey tests.

Every mutant is applied to the pinned upstream source, each layer is executed independently, and the original file is restored in a `finally` block. A layer kills a mutant only when its command actually fails.

## Evidence dashboard

GitHub Pages publishes the experiment design immediately. A manually triggered **Strategy Benchmark** workflow can regenerate runtime + mutation evidence and deploy the resulting JSON with the dashboard.

Expected URL after Pages is enabled by the workflow:

`https://carlacazv.github.io/testing-strategy-lab/`

## Principles

- Runtime is not defect-detection evidence.
- Coverage percentage is not treated as confidence.
- A slow layer can still be essential if it uniquely guards a critical risk.
- A fast layer can still be low-value if it kills no meaningful mutants.
- Strategy selection should be based on marginal detection value, not geometry alone.

## License

The lab code is MIT licensed. The upstream Conduit application remains under its own MIT license and is fetched at runtime; see [`THIRD_PARTY.md`](THIRD_PARTY.md).
