import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home.page.mjs';

test('home renders the open-source frontend against the deterministic API', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  await expect(home.brandHeading).toBeVisible();
  await expect(page.getByText('A place to share your knowledge.')).toBeVisible();
  await expect(home.tagSidebar).toBeVisible();
  await expect(home.articleTitle).toBeVisible();
  await expect(page.getByText('testing', { exact: true }).first()).toBeVisible();
});

test('article preview navigates through the real router', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.articleTitle.click();
  await expect(page).toHaveURL(/\/article\/testing-strategies-with-evidence$/);
  await expect(page.getByRole('heading', { name: 'Testing strategies with evidence' })).toBeVisible();
});
