/* eslint-disable no-console */
/**
 * Orchestrates the API integration suite:
 *
 *   1. docker compose up (builds the umami image, starts Postgres [+ ClickHouse])
 *   2. waits for /api/heartbeat
 *   3. runs Playwright against the container (tests/api, playwright.api.config.ts)
 *   4. dumps container logs on failure
 *   5. tears the stack down (unless --keep)
 *
 * Usage: tsx scripts/test-api.ts [options] [-- playwright args]
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMPOSE_FILE = 'docker-compose.test.yml';
const PROJECT_NAME = process.env.COMPOSE_PROJECT_NAME || 'umami-api-test';
const PORT = process.env.UMAMI_TEST_PORT || '3100';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;
// PLAYWRIGHT_BASE_URL selects an already-running server: no Compose stack is
// built, started, or torn down for it.
const EXTERNAL_TARGET = !!process.env.PLAYWRIGHT_BASE_URL;
const HEARTBEAT_TIMEOUT_MS = 180_000;
// Mirrors RUNTIME_DIR in tests/api/paths.ts (one state dir per target host).
const LOG_FILE = path.join(
  ROOT_DIR,
  'tests/api/.runtime',
  new URL(BASE_URL).host.replace(/[^a-z0-9.-]+/gi, '-'),
  'docker.log',
);

const HELP = `
Usage: pnpm test:api [options] [-- playwright args]

Options:
  --clickhouse        Run against Postgres + ClickHouse (analytics stored in ClickHouse)
  --keep              Leave the containers running after the tests finish
  --no-build          Skip the image build (use the existing UMAMI_TEST_IMAGE)
  --up-only           Start the stack, wait for readiness, and exit (see --keep)
  --down              Tear down the stack and exit
  --grep <expr>       Only run matching tests (implies --coverage-report)
  --coverage-report   Print endpoint coverage without failing the run
  -h, --help          Show this help

Environment:
  UMAMI_TEST_PORT     Host port for the app (default 3100)
  UMAMI_TEST_IMAGE    Image tag to build/run (default umami-test:local)
  COMPOSE_PROJECT_NAME  Compose project name (default umami-api-test)
  PLAYWRIGHT_BASE_URL  Test an already-running server instead of starting the
                      Compose stack (pass --clickhouse if it stores analytics there)
  API_SKIP_SEED=1     Reuse the previous seed when re-running against a kept stack
                      (each run seeds additively otherwise)
`;

interface Options {
  clickhouse: boolean;
  keep: boolean;
  build: boolean;
  upOnly: boolean;
  down: boolean;
  grep?: string;
  coverageReport: boolean;
  passthrough: string[];
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    clickhouse: false,
    keep: false,
    build: true,
    upOnly: false,
    down: false,
    coverageReport: false,
    passthrough: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') {
      options.passthrough.push(...argv.slice(i + 1));
      break;
    }

    if (arg.startsWith('--grep=')) {
      options.grep = arg.slice('--grep='.length);
      continue;
    }

    switch (arg) {
      case '--clickhouse':
        options.clickhouse = true;
        break;
      case '--keep':
        options.keep = true;
        break;
      case '--no-build':
        options.build = false;
        break;
      case '--up-only':
        options.upOnly = true;
        break;
      case '--down':
        options.down = true;
        break;
      case '--coverage-report':
        options.coverageReport = true;
        break;
      case '--grep':
        options.grep = argv[++i];
        break;
      case '-h':
      case '--help':
        console.log(HELP);
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        console.log(HELP);
        process.exit(2);
    }
  }

  return options;
}

function run(command: string, args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function capture(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });

  return `${result.stdout ?? ''}${result.stderr ?? ''}`;
}

function composeArgs(profiles: string[], args: string[]) {
  return [
    'compose',
    '-f',
    COMPOSE_FILE,
    '-p',
    PROJECT_NAME,
    ...profiles.flatMap(profile => ['--profile', profile]),
    ...args,
  ];
}

async function waitForHeartbeat(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  let lastError = '';

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/api/heartbeat`);

      if (response.ok) {
        return;
      }

      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = (error as Error).message;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}/api/heartbeat (${lastError})`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const profile = options.clickhouse ? 'clickhouse' : 'postgres';
  const appService = options.clickhouse ? 'umami-clickhouse' : 'umami';
  const logServices = options.clickhouse ? [appService, 'db', 'clickhouse'] : [appService, 'db'];

  const teardown = () => {
    console.log('\nStopping test stack...');
    run('docker', composeArgs(['postgres', 'clickhouse'], ['down', '-v', '--remove-orphans']));
  };

  if (EXTERNAL_TARGET && (options.upOnly || options.down)) {
    console.error(
      'PLAYWRIGHT_BASE_URL selects an already-running server; --up-only and --down manage ' +
        'the local Compose stack and cannot be combined with it.',
    );
    return 2;
  }

  if (options.down) {
    teardown();
    return 0;
  }

  const dumpLogs = () => {
    const logs = capture('docker', composeArgs([profile], ['logs', '--no-color', ...logServices]));

    mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    writeFileSync(LOG_FILE, logs);

    console.log(`\n--- docker compose logs (${logServices.join(', ')}) ---\n`);
    console.log(logs);
    console.log(`--- end of logs (saved to ${path.relative(ROOT_DIR, LOG_FILE)}) ---\n`);
  };

  let exitCode = 1;
  let started = false;

  const onSignal = () => {
    console.log('\nInterrupted.');

    if (started && !options.keep) {
      teardown();
    }

    process.exit(130);
  };

  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  try {
    if (EXTERNAL_TARGET) {
      console.log(`Using the already-running server at ${BASE_URL} (PLAYWRIGHT_BASE_URL is set).`);
    } else {
      console.log(`Starting test stack (profile: ${profile}, port: ${PORT})...`);

      const upArgs = ['up', '-d', '--wait', '--wait-timeout', '300'];

      if (options.build) {
        upArgs.push('--build');
      }

      started = true;

      if (run('docker', composeArgs([profile], upArgs)) !== 0) {
        console.error('docker compose up failed.');
        dumpLogs();
        return 1;
      }
    }

    await waitForHeartbeat(BASE_URL, HEARTBEAT_TIMEOUT_MS);

    console.log(`umami is ready at ${BASE_URL}`);

    if (options.upOnly) {
      options.keep = true;
      console.log(
        `\nRun tests with: PLAYWRIGHT_BASE_URL=${BASE_URL} UMAMI_TEST_DB=${profile} pnpm test:api:run` +
          '\nRe-running against the same stack? Add API_SKIP_SEED=1 (seeding is additive).' +
          '\nStop the stack with: pnpm test:api:down',
      );
      return 0;
    }

    const playwrightArgs = ['exec', 'playwright', 'test', '-c', 'playwright.api.config.ts'];

    if (options.grep) {
      playwrightArgs.push('--grep', options.grep);
    }

    playwrightArgs.push(...options.passthrough);

    exitCode = run(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', playwrightArgs, {
      PLAYWRIGHT_BASE_URL: BASE_URL,
      PLAYWRIGHT_SKIP_WEB_SERVER: '1',
      UMAMI_TEST_DB: profile,
      API_COVERAGE:
        process.env.API_COVERAGE ?? (options.grep || options.coverageReport ? 'report' : 'enforce'),
    });

    if (exitCode !== 0 && started) {
      dumpLogs();
    }

    return exitCode;
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);

    if (started && !options.keep) {
      teardown();
    } else if (started) {
      console.log(`\nStack left running (${BASE_URL}). Stop it with: pnpm test:api:down`);
    }
  }
}

main()
  .then(code => {
    process.exit(code);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
