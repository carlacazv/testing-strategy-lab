import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('@a11y home has no critical axe violations', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Testing strategies with evidence' }).waitFor();

  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach('axe-results.json', {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: 'application/json',
  });

  const critical = results.violations.filter((violation) => violation.impact === 'critical');
  expect(critical).toEqual([]);
});
