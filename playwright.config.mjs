import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node scripts/mock-api.mjs',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: !isCI,
      timeout: 30_000,
    },
    {
      command: 'npm --prefix .sut/conduit run dev -w frontend -- --host 127.0.0.1',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
