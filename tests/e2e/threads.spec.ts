import { test, expect } from '@playwright/test';

test.describe('Thread Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome screen when no thread is selected', async ({ page }) => {
    await expect(page.getByText('System Initialized')).toBeVisible();
    await expect(page.getByText('INITIALIZE_NEW_THREAD')).toBeVisible();
  });

  test('should create a new thread', async ({ page }) => {
    // Click create thread button
    await page.getByRole('button', { name: /NEW THREAD/i }).click();

    // Should show the thread in the list
    await expect(page.getByText('New Thread')).toBeVisible();

    // Should show chat area
    await expect(page.getByText('ACTIVE_THREAD:')).toBeVisible();
  });

  test('should switch between threads', async ({ page }) => {
    // Create first thread
    await page.getByRole('button', { name: /NEW THREAD/i }).click();
    await expect(page.getByText('ACTIVE_THREAD:')).toBeVisible();

    // Create second thread
    await page.getByRole('button', { name: /NEW THREAD/i }).click();

    // Should have two threads
    const threads = page.locator('[class*="border-b"][class*="cursor-pointer"]');
    await expect(threads).toHaveCount(2);

    // Click first thread
    await threads.first().click();

    // Should switch to first thread
    await expect(page.getByText('ACTIVE_THREAD:')).toBeVisible();
  });

  test('should delete a thread', async ({ page }) => {
    // Create a thread
    await page.getByRole('button', { name: /NEW THREAD/i }).click();
    await expect(page.getByText('New Thread')).toBeVisible();

    // Hover over thread to show delete button
    const threadItem = page.locator('[class*="border-b"][class*="cursor-pointer"]').first();
    await threadItem.hover();

    // Click delete button
    await threadItem.getByRole('button').click();

    // Thread should be removed
    await expect(page.getByText('No threads yet...')).toBeVisible();
  });

  test('should show thread ID in the list', async ({ page }) => {
    await page.getByRole('button', { name: /NEW THREAD/i }).click();

    // Should show thread ID prefix
    await expect(page.getByText(/ID: #/)).toBeVisible();
  });
});
