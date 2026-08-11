const { test, expect } = require('@playwright/test');

test.describe('Smart Garage - flujo E2E público', () => {
  test('usuario abre búsqueda, consulta catálogo y obtiene resultados', async ({ page }) => {
    await page.goto('/busqueda');
    await expect(page).toHaveTitle(/Búsqueda/i);

    await page.locator('#q').fill('aceite');
    await page.locator('#btnBuscar').click();

    await expect(page.locator('#status')).toContainText('Resultados');
    await expect(page.locator('#resultados')).not.toBeEmpty();
  });

  test('login y aviso de privacidad son accesibles desde la interfaz', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByRole('link', { name: /Crear cuenta/i }).click();

  await expect(page).toHaveURL(/\/auth\/register/);

  await expect(
    page.locator('#registerForm')
      .getByRole('link', { name: 'Aviso de Privacidad' })
  ).toBeVisible();
});
});
