import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

test.describe('Auth smoke', () => {
  test.skip(!email || !password, 'E2E_EMAIL/E2E_PASSWORD not set');

  test('login and reach dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill(email as string);
    await page.getByLabel('Contraseña').fill(password as string);
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
