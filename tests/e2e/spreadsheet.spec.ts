import { test, expect } from '@playwright/test';

test.describe('Spreadsheet Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Create a thread first
    await page.getByRole('button', { name: /NEW THREAD/i }).click();
  });

  test('should open spreadsheet modal when clicking GRID button', async ({ page }) => {
    await page.getByRole('button', { name: /GRID/i }).click();

    // Modal should be visible
    await expect(page.getByText('SPREADSHEET:')).toBeVisible();
  });

  test('should close spreadsheet modal when clicking close button', async ({ page }) => {
    await page.getByRole('button', { name: /GRID/i }).click();
    await expect(page.getByText('SPREADSHEET:')).toBeVisible();

    // Click close button (X icon)
    await page.locator('[title="Close"]').click();

    // Modal should be hidden
    await expect(page.getByText('SPREADSHEET:')).not.toBeVisible();
  });

  test('should close spreadsheet modal when clicking backdrop', async ({ page }) => {
    await page.getByRole('button', { name: /GRID/i }).click();
    await expect(page.getByText('SPREADSHEET:')).toBeVisible();

    // Click backdrop
    await page.locator('.bg-black.bg-opacity-50').click({ position: { x: 10, y: 10 } });

    // Modal should be hidden
    await expect(page.getByText('SPREADSHEET:')).not.toBeVisible();
  });

  test('should show loading state when opening modal', async ({ page }) => {
    await page.getByRole('button', { name: /GRID/i }).click();

    // Should show loading or data
    const loadingOrData = page.getByText('LOADING_DATA...').or(page.locator('table'));
    await expect(loadingOrData).toBeVisible();
  });

  test('should show instructions in modal footer', async ({ page }) => {
    await page.getByRole('button', { name: /GRID/i }).click();

    await expect(page.getByText(/Click and drag to select cells/i)).toBeVisible();
  });
});
