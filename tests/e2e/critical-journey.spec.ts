import { test, expect } from '@playwright/test';

test.describe('Critical User Journey', () => {
  test('should load the application and show login or hub', async ({ page }) => {
    await page.goto('/');

    // Since this app uses Clerk for auth, unauthenticated users might be redirected to a login page.
    // Or if there's a landing page, they see that.
    // For this simple test, we just wait for the page to load and ensure it doesn't crash (white screen of death).
    await expect(page).toHaveTitle(/StudyFlow/i);
    
    // Check if body is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
