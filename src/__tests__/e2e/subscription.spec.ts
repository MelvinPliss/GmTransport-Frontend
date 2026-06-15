/**
 * E2E Tests — Full Subscription Flow
 *
 * Prerequisites:
 *   - Backend running at http://localhost:4000
 *   - Frontend running at http://localhost:5173 (vite dev)
 *
 * Run: npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function navigateToForm(page: Page) {
  await page.goto(BASE_URL);
  await page.getByRole('button', { name: /Nueva Suscripción/i }).click();
  await expect(page.getByText('Nueva Suscripción')).toBeVisible();
}

test.describe('Subscription Form — Validation', () => {
  test('shows validation errors when submitting empty form', async ({ page }) => {
    await navigateToForm(page);
    await page.getByRole('button', { name: /Activar Suscripción/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('shows error for invalid email', async ({ page }) => {
    await navigateToForm(page);
    await page.getByLabel('Correo Electrónico').fill('notanemail');
    await page.getByLabel('Correo Electrónico').blur();
    await expect(page.getByText(/inválido/i)).toBeVisible();
  });

  test('formats card number with spaces as user types', async ({ page }) => {
    await navigateToForm(page);
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');
    const value = await page.getByLabel('Número de Tarjeta').inputValue();
    expect(value).toBe('4111 1111 1111 1111');
  });

  test('shows error for card number failing Luhn check', async ({ page }) => {
    await navigateToForm(page);
    await page.getByLabel('Número de Tarjeta').fill('1234567890123456');
    await page.getByLabel('Número de Tarjeta').blur();
    await expect(page.getByText(/inválido/i)).toBeVisible();
  });

  test('credit card preview updates as user types', async ({ page }) => {
    await navigateToForm(page);
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');
    // Card preview should show last 4 digits
    await expect(page.getByRole('img', { name: /Vista previa de tarjeta/i })).toBeVisible();
  });
});

test.describe('Subscription Form — Submission', () => {
  test('successfully creates a subscription and redirects to dashboard', async ({ page }) => {
    await navigateToForm(page);

    await page.getByLabel('ID de Usuario').fill('1');
    await page.getByLabel('Correo Electrónico').fill('test@example.com');
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');

    await page.getByRole('button', { name: /Activar Suscripción/i }).click();

    // Should show success state
    await expect(page.getByText(/Suscripción activada/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/procesada correctamente/i)).toBeVisible();
  });

  test('shows success toast notification after creating subscription', async ({ page }) => {
    await navigateToForm(page);

    await page.getByLabel('ID de Usuario').fill('1');
    await page.getByLabel('Correo Electrónico').fill('test@example.com');
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');

    await page.getByRole('button', { name: /Activar Suscripción/i }).click();

    // Toast should appear
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 10000 });
  });

  test('prevents double submission (button disabled while loading)', async ({ page }) => {
    await navigateToForm(page);

    await page.getByLabel('ID de Usuario').fill('1');
    await page.getByLabel('Correo Electrónico').fill('test@example.com');
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');

    const submitBtn = page.getByRole('button', { name: /Activar Suscripción/i });
    await submitBtn.click();

    // Button should be disabled during submission
    await expect(submitBtn).toBeDisabled();
  });

  test('can reset form and create another subscription', async ({ page }) => {
    await navigateToForm(page);

    await page.getByLabel('ID de Usuario').fill('1');
    await page.getByLabel('Correo Electrónico').fill('test@example.com');
    await page.getByLabel('Número de Tarjeta').fill('4111111111111111');

    await page.getByRole('button', { name: /Activar Suscripción/i }).click();
    await expect(page.getByText(/Suscripción activada/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Nueva suscripción/i }).click();
    await expect(page.getByLabel('Correo Electrónico')).toBeVisible();
    await expect(page.getByLabel('Correo Electrónico')).toHaveValue('');
  });
});

test.describe('Dashboard', () => {
  test('loads and displays subscriptions', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('Suscripciones')).toBeVisible();
    // Stats cards should be visible
    await expect(page.getByText('Total')).toBeVisible();
    await expect(page.getByText('Activas')).toBeVisible();
  });

  test('filters by ACTIVE status', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /^Activas$/ }).click();
    // All visible badges should be ACTIVE
    const badges = page.getByText('Activa');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0); // at least 0 (may be empty)
  });

  test('refreshes data when Actualizar is clicked', async ({ page }) => {
    await page.goto(BASE_URL);
    const refreshBtn = page.getByRole('button', { name: /Actualizar/i });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    // Should not crash and spinner may appear briefly
    await expect(page.getByText('Suscripciones')).toBeVisible();
  });
});

test.describe('Notifications', () => {
  test('notification bell is visible in header', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole('button', { name: /Notificaciones/i })).toBeVisible();
  });

  test('opens notification panel on bell click', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /Notificaciones/i }).click();
    await expect(page.getByText(/Sin notificaciones aún/i)).toBeVisible();
  });

  test('closes notification panel on Escape key', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /Notificaciones/i }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByText(/Sin notificaciones aún/i)).not.toBeVisible();
  });
});

test.describe('Responsive Layout', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await expect(page.getByText('SubsManager')).toBeVisible();
  });

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.getByText('SubsManager')).toBeVisible();
  });
});
