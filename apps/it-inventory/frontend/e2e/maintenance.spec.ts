import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;

async function login(page: any) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email as string);
  await page.getByLabel('Contraseña').fill(password as string);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL('**/dashboard');
}

test.describe('Maintenance smoke', () => {
  test.skip(!email || !password, 'E2E_EMAIL/E2E_PASSWORD not set');

  test('navigate to maintenance page', async ({ page }) => {
    await login(page);
    await page.goto('/maintenance');
    await expect(page.getByRole('heading', { name: 'Mantenimientos' })).toBeVisible();
  });
});
