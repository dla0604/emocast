import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';

const rounds = 3;
const outputPath = join(process.cwd(), '.github', 'reports', 'CI_CACHE_BENCHMARK.md');
const measurements = [];

async function runInstall(cachePath, preference) {
  const start = performance.now();
  const result = spawnSync(
    'npm',
    ['ci', '--cache', cachePath, preference],
    {
      encoding: 'utf8',
      stdio: 'pipe',
    },
  );
  const durationSeconds = (performance.now() - start) / 1000;

  if (result.error || result.status !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    throw new Error(
      `npm ci ${preference} failed (${result.status ?? result.error}):\n${output}`,
    );
  }

  return durationSeconds;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

const benchmarkCacheRoot = await mkdtemp(join(tmpdir(), 'emocast-npm-cache-'));

try {
  for (let round = 1; round <= rounds; round += 1) {
    const cachePath = join(benchmarkCacheRoot, `round-${round}`);
    await mkdir(cachePath);

    const coldSeconds = await runInstall(cachePath, '--prefer-online');
    const warmSeconds = await runInstall(cachePath, '--prefer-offline');
    measurements.push({ round, coldSeconds, warmSeconds });
  }
} finally {
  await rm(benchmarkCacheRoot, { recursive: true, force: true });
}

const coldMedian = median(measurements.map(({ coldSeconds }) => coldSeconds));
const warmMedian = median(measurements.map(({ warmSeconds }) => warmSeconds));
const improvementPercent = ((coldMedian - warmMedian) / coldMedian) * 100;
const revision = process.env.GITHUB_SHA ?? 'local';
const runner = process.env.RUNNER_OS ?? process.platform;

const report = [
  '# npm cache benchmark',
  '',
  `- Revision: \`${revision}\``,
  `- Runner: \`${runner}\``,
  `- Node.js: \`${process.version}\``,
  `- npm: \`${spawnSync('npm', ['--version'], { encoding: 'utf8' }).stdout.trim()}\``,
  `- Method: ${rounds} paired \`npm ci\` runs on one runner, each using a new local npm cache; the cold run populates that cache and the warm run reuses it.`,
  '- Timed scope: dependency installation only; lint, build, and test time are excluded.',
  '',
  '| Pair | Cold install (s) | Warm install (s) |',
  '| ---: | ---: | ---: |',
  ...measurements.map(
    ({ round, coldSeconds, warmSeconds }) =>
      `| ${round} | ${coldSeconds.toFixed(1)} | ${warmSeconds.toFixed(1)} |`,
  ),
  `| **Median** | **${coldMedian.toFixed(1)}** | **${warmMedian.toFixed(1)}** |`,
  '',
  `**Median install-time reduction: ${improvementPercent.toFixed(1)}%**`,
  '',
  'Formula: `(cold median - warm median) / cold median * 100`. Paired runs use the same runner, commit, Node/npm versions, and lockfile; only npm cache state differs. This is a dependency-install microbenchmark, not a claim about total workflow wall time.',
  '',
].join('\n');

await mkdir(join(process.cwd(), '.github', 'reports'), { recursive: true });
await writeFile(outputPath, report, 'utf8');
console.log(report);
