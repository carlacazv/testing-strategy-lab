import { expect, test } from '@playwright/test';
import { LoginPage } from './pages/login.page.mjs';

test('login persists auth state and returns the user to home', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login({ email: 'qa@example.com', password: 'secret' });

  await expect(page).toHaveURL(/\/#\/$/);
  await expect(page.getByText('strategy_lab', { exact: true })).toBeVisible();
  await expect(page.getByText('A place to share your knowledge.')).toHaveCount(0);

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('loggedUser')));
  expect(persisted.isAuth).toBe(true);
  expect(persisted.loggedUser.token).toBe('strategy-lab-token');
});
