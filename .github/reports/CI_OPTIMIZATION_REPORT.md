# CI optimization report

## Changes

- The previous workflow used separate build and test jobs for each of four OS/Node combinations. Each job ran `npm ci`, for eight dependency installations in total.
- The new reusable workflow calls a composite action that performs `npm ci`, lint, build, and tests once per matrix entry. The matrix now covers Ubuntu and Windows with Node.js 20, 22, and 24: six combinations and six dependency installations, while adding two runtime combinations.
- Both the composite action and the npm cache benchmark use the committed `package-lock.json` through `npm ci`.
- `dorny/paths-filter` skips the matrix for documentation-only changes. App and CI configuration changes run it; production website changes are separately detected.
- GitHub Pages deployment is limited to successful pushes to `main` that change website paths. Pull requests never deploy. The production artifact is built on Ubuntu with Node.js 22.

## Cache measurement

The original CI already enabled npm caching through `actions/setup-node`, so repository history does not provide a valid uncached full-workflow baseline. The paired benchmark measures the narrower, reproducible effect of npm's dependency cache instead of attributing unrelated runner or workflow changes to caching.

On each benchmark run, three pairs of `npm ci` are measured sequentially on the same Ubuntu runner, Node/npm versions, commit, and lockfile. Each pair starts with a fresh npm cache; the first install uses `--prefer-online`, and the second reuses the populated cache with `--prefer-offline`. The report records each pair, the median times, and `(cold median - warm median) / cold median × 100`. Lint, build, tests, and total workflow duration are not part of this install-time comparison.

The [pre-change PR run](https://github.com/dla0604/emocast/actions/runs/43698138668) completed in **2m 01s** (started 2026-11-15 09:12:48 UTC, completed 09:14:49 UTC). That is one observed run, not a controlled end-to-end comparison; runner and workflow variation prevent attributing elapsed-time differences to a single change. The optimized run's elapsed time and the paired install measurements will be added from its actual Actions run before finalizing this report.

The PR's `npm Cache Benchmark` workflow uploads the measured values as the `npm-cache-benchmark` artifact (`.github/reports/CI_CACHE_BENCHMARK.md`). No cache timing values are prefilled because they must come from an actual Actions runner.

## Deployment setup note

The repository currently has no GitHub Pages site configured. Before the gated production deploy can publish, enable Pages in repository settings with **GitHub Actions** as the build and deployment source. Until then, the deploy job cannot publish a site.
