/// <reference types="node" />
import { defineConfig, type ReporterDescription } from '@playwright/test';
import { BASE_URL as baseURL } from './tests/api/paths';

/**
 * Playwright config for the API integration suite (tests/api).
 *
 * The suite only uses the `request` fixture — no browser is launched. It expects
 * a running umami server (normally started by scripts/test-api.ts via
 * docker-compose.test.yml) at PLAYWRIGHT_BASE_URL or http://localhost:3100.
 */

const reporters: ReporterDescription[] = [['list'], ['./tests/api/coverage/reporter.ts']];

if (process.env.CI) {
  reporters.push(['html', { open: 'never', outputFolder: 'playwright-report/api' }]);
}

export default defineConfig({
  testDir: './tests/api',
  testMatch: '**/*.spec.ts',
  outputDir: 'test-results/api',
  fullyParallel: false,
  workers: process.env.API_WORKERS ? Number(process.env.API_WORKERS) : 1,
  // Specs are deterministic and share coverage state; retries would only hide flakes.
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  globalSetup: './tests/api/global-setup.ts',
  reporter: reporters,
  use: {
    baseURL,
    trace: 'off',
  },
  projects: [{ name: 'api' }],
});
