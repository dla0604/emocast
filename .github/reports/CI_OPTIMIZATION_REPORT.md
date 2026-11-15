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

The [pre-change PR run](https://github.com/dla0604/emocast/actions/runs/43698138668) completed in **2m 01s** (started 2026-11-15 09:12:48 UTC, completed 09:14:49 UTC). The [optimized PR run](https://github.com/dla0604/emocast/actions/runs/43699035256) completed in **1m 00s** (started 09:23:35 UTC, completed 09:24:35 UTC), an observed wall-clock reduction of **50.4%**. The baseline ran 8 `npm ci` jobs across 4 OS/Node combinations; the optimized workflow passed all 6 combinations and ran 6 installs. These are single Actions runs, not a controlled end-to-end experiment; queue time, runner load, and the expanded matrix can affect the comparison, so the elapsed-time delta is observational rather than a causal performance claim.

The [paired cache benchmark](https://github.com/dla0604/emocast/actions/runs/43699035243) ran on Linux with Node.js 22.23.4 and npm 10.9.9:

| Pair | Cold `npm ci` (s) | Warm `npm ci` (s) |
| ---: | ---: | ---: |
| 1 | 36.4 | 6.9 |
| 2 | 35.7 | 3.5 |
| 3 | 35.6 | 6.8 |
| **Median** | **35.7** | **6.8** |

The measured median dependency-install reduction was **80.9%**, calculated from the unrounded medians as `(cold median - warm median) / cold median * 100`; displayed times are rounded to tenths of a second. The PR workflow also uploads the raw generated report as the `npm-cache-benchmark` artifact.

## Deployment setup note

The repository currently has no GitHub Pages site configured. Before the gated production deploy can publish, enable Pages in repository settings with **GitHub Actions** as the build and deployment source. Until then, the deploy job cannot publish a site.
