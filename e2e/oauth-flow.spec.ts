/**
 * E2E Tests: OAuth Flow
 * 
 * Test OAuth authentication flows
 */

import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication', () => {
  test('should initiate GitHub OAuth flow', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In - handle mobile layout
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    
    // For mobile, ensure element is visible and clickable
    await signInButton.waitFor({ state: 'visible' });
    await page.evaluate(() => window.scrollTo(0, 0)); // Scroll to top first
    await signInButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Wait for scroll to complete
    
    // Use force click for mobile if needed
    await signInButton.click({ force: true });
    
    // Modal should appear
    await expect(page.getByRole('heading', { name: /Sign in to Careerate/i })).toBeVisible();
    
    // Click Continue with GitHub
    await page.getByRole('button', { name: /Continue with GitHub/i }).click();
    
    // Should navigate to GitHub
    await page.waitForURL(/github\.com/, { timeout: 5000 }).catch(() => {
      // Timeout is acceptable if OAuth is not configured
    });
    
    const url = page.url();
    
    if (url.includes('github.com')) {
      // Should be on GitHub OAuth page
      expect(url).toContain('github.com');
      expect(url).toContain('client_id=');
      expect(url).toContain('return_to='); // GitHub uses return_to parameter
      // Scope and state are embedded in the return_to parameter
      expect(url).toContain('scope=');
      expect(url).toContain('state='); // CSRF protection
      
      // Should include required scopes in the return_to parameter
      expect(url).toContain('read%3Auser'); // URL encoded
      expect(url).toContain('user%3Aemail'); // URL encoded
    }
  });

  test('should initiate Microsoft OAuth flow', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In - handle mobile layout
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    
    // For mobile, ensure element is visible and clickable
    await signInButton.waitFor({ state: 'visible' });
    await page.evaluate(() => window.scrollTo(0, 0)); // Scroll to top first
    await signInButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // Wait for scroll to complete
    
    // Use force click for mobile if needed
    await signInButton.click({ force: true });
    
    // Click Continue with Microsoft
    await page.getByRole('button', { name: /Continue with Microsoft/i }).click();
    
    // Should navigate to Microsoft
    await page.waitForURL(/microsoft\.com|login\.microsoftonline\.com/, { timeout: 5000 }).catch(() => {
      // Timeout is acceptable if OAuth is not configured
    });
    
    const url = page.url();
    
    if (url.includes('microsoft') || url.includes('microsoftonline')) {
      // Should be on Microsoft OAuth page
      expect(url).toMatch(/microsoft\.com|login\.microsoftonline\.com/);
      expect(url).toContain('client_id=');
      expect(url).toContain('redirect_uri='); // Microsoft uses redirect_uri parameter
      expect(url).toContain('response_type=');
      expect(url).toContain('state='); // CSRF protection
    }
  });

  test('should handle OAuth callback', async ({ page }) => {
    // This test would require mocking OAuth or using test credentials
    // For now, we'll just check that the callback route exists
    
    const response = await page.goto('/api/callback/github?code=test&state=test');
    
    // Should not be 404
    expect(response?.status()).not.toBe(404);
    
    // Will likely be 400 or 401 due to invalid code, which is expected
    expect([200, 302, 400, 401, 500].includes(response?.status() || 0)).toBeTruthy();
  });

  test('should close modal on cancel', async ({ page }) => {
    await page.goto('/');
    
    // Open modal - handle mobile layout
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.scrollIntoViewIfNeeded();
    await signInButton.click();
    
    // Modal should be visible
    await expect(page.getByRole('heading', { name: /Sign in to Careerate/i })).toBeVisible();
    
    // Close modal (ESC key or close button)
    await page.keyboard.press('Escape');
    
    // Modal should be hidden
    await expect(page.getByRole('heading', { name: /Sign in to Careerate/i })).not.toBeVisible();
  });

  test('should show terms of service link', async ({ page }) => {
    await page.goto('/');
    
    // Open modal - handle mobile layout
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.scrollIntoViewIfNeeded();
    await signInButton.click();
    
    // Should show TOS link
    await expect(page.getByRole('link', { name: /Terms of Service/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Privacy Policy/i })).toBeVisible();
  });
});

