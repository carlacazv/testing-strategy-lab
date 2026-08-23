import { expect, test } from '@playwright/test';

test('login persists auth state and returns the user to home', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('qa@example.com');
  await page.getByPlaceholder('Password').fill('secret');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await expect(page.getByText('strategy_lab', { exact: true })).toBeVisible();
  await expect(page.getByText('A place to share your knowledge.')).toHaveCount(0);

  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('loggedUser')));
  expect(persisted.isAuth).toBe(true);
  expect(persisted.loggedUser.token).toBe('strategy-lab-token');
});
