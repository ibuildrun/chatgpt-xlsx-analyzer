import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Create a thread first
    await page.getByRole('button', { name: /NEW THREAD/i }).click();
  });

  test('should show API key required message when no key is set', async ({ page }) => {
    await expect(page.getByText('API KEY REQUIRED')).toBeVisible();
  });

  test('should show disabled input when no API key', async ({ page }) => {
    const textarea = page.locator('textarea');
    await expect(textarea).toHaveAttribute('placeholder', /Set your API key/i);
  });

  test('should open API key settings modal', async ({ page }) => {
    await page.getByRole('button', { name: /SET KEY/i }).click();
    await expect(page.getByText('API Key Settings')).toBeVisible();
  });

  test('should validate API key format', async ({ page }) => {
    await page.getByRole('button', { name: /SET KEY/i }).click();

    // Enter invalid key
    await page.locator('input[type="password"]').fill('invalid-key');
    await page.getByRole('button', { name: /SAVE/i }).click();

    // Should show error
    await expect(page.getByText(/Invalid API key format/i)).toBeVisible();
  });

  test('should save valid API key', async ({ page }) => {
    await page.getByRole('button', { name: /SET KEY/i }).click();

    // Enter valid key format
    await page.locator('input[type="password"]').fill('sk-test1234567890123456789012345');
    await page.getByRole('button', { name: /SAVE/i }).click();

    // Modal should close
    await expect(page.getByText('API Key Settings')).not.toBeVisible();

    // Button should show KEY SET
    await expect(page.getByRole('button', { name: /KEY SET/i })).toBeVisible();
  });

  test('should show awaiting input message in empty chat', async ({ page }) => {
    await expect(page.getByText('AWAITING_INPUT...')).toBeVisible();
  });

  test('should have GRID button in input area', async ({ page }) => {
    await expect(page.getByRole('button', { name: /GRID/i })).toBeVisible();
  });

  test('should have SEND button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /SEND/i })).toBeVisible();
  });
});
