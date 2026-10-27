import { writeFile, mkdir } from 'node:fs/promises';
import { cpus, totalmem, freemem } from 'node:os';
import { performance } from 'node:perf_hooks';

// Bounded, read-only HTTP probe. This measures endpoints, not browser sessions
// or successful booking/chat workflows. Keep its targets on the local machine.
const frontend = process.env.LOAD_FRONTEND_URL || 'http://127.0.0.1:4173';
const backend = process.env.LOAD_BACKEND_URL || 'http://127.0.0.1:3000';
for (const target of [frontend, backend]) {
  const url = new URL(target);
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('This probe only permits local HTTP targets. Use an approved staging environment for remote load testing.');
  }
}
const durationMs = 6000;
const timeoutMs = 5000;
const results = [];
const quantile = (items, p) => items[Math.max(0, Math.ceil(items.length * p) - 1)] ?? null;
const scenarios = [
  { name: 'Frontend production HTML', url: `${frontend}/`, levels: [5, 25, 50], pauseMs: 100 },
  { name: 'Backend liveness', url: `${backend}/health`, levels: [5, 25, 50], pauseMs: 100 },
  { name: 'Database readiness (SELECT 1)', url: `${backend}/ready`, levels: [1, 5, 10], pauseMs: 200 },
];

for (const scenario of scenarios) {
  const warmup = await fetch(scenario.url, { signal: AbortSignal.timeout(timeoutMs) });
  await warmup.arrayBuffer();
  if (!warmup.ok) throw new Error(`Warmup failed: ${scenario.name} HTTP ${warmup.status}`);
  for (const concurrency of scenario.levels) {
    const samples = [], statuses = {}, errors = {};
    let failed = 0;
    const started = performance.now();
    const deadline = started + durationMs;
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (performance.now() < deadline) {
        const requestStarted = performance.now();
        try {
          const response = await fetch(scenario.url, { signal: AbortSignal.timeout(timeoutMs) });
          await response.arrayBuffer();
          statuses[response.status] = (statuses[response.status] || 0) + 1;
          if (!response.ok) failed++;
        } catch (error) {
          failed++;
          errors[error.name] = (errors[error.name] || 0) + 1;
        }
        samples.push(performance.now() - requestStarted);
        await new Promise(resolve => setTimeout(resolve, scenario.pauseMs));
      }
    }));
    const elapsed = performance.now() - started;
    samples.sort((a, b) => a - b);
    const round = n => n == null ? null : Math.round(n * 100) / 100;
    const result = {
      scenario: scenario.name, concurrency, requests: samples.length, failed,
      errorPercent: round(failed / samples.length * 100),
      requestsPerSecond: round(samples.length / (elapsed / 1000)),
      latencyMs: { p50: round(quantile(samples, .5)), p95: round(quantile(samples, .95)), p99: round(quantile(samples, .99)), max: round(samples.at(-1)) },
      statuses, errors,
    };
    results.push(result);
    console.log(JSON.stringify(result));
    // Stop raising load when the current endpoint is already failing.
    if (result.errorPercent > 5) break;
  }
}
const report = {
  timestamp: new Date().toISOString(),
  setup: {
    frontend, backend, node: process.version, durationMs, timeoutMs,
    cpu: cpus()[0]?.model, logicalCpus: cpus().length,
    totalMemoryGiB: Math.round(totalmem() / 1024 ** 3), freeMemoryGiB: Math.round(freemem() / 1024 ** 3 * 100) / 100,
    limitations: [
      'Same-machine load generator; local hardware is not the IIT deployment server.',
      'Frontend uses Vite production preview; backend is the running local development server.',
      'Readiness uses the currently configured PostgreSQL database and executes only SELECT 1.',
      'No authenticated searches, bookings, chat load, browser asset rendering, or soak test.',
      'Closed-loop concurrency with pauses; observed throughput is not maximum capacity.',
    ],
  }, results,
};
const output = process.env.LOAD_REPORT_PATH || 'docs/load-test-results.json';
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(`Report saved: ${output}`);
