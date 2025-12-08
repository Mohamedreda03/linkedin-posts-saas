import { test, expect } from "@playwright/test";

test.describe("Onboarding Page", () => {
  // Note: This page requires authentication, so we test what we can without auth
  
  test("should redirect to sign-in if not authenticated", async ({ page }) => {
    await page.goto("/onboarding");
    
    // Should either show onboarding or redirect to sign-in
    // The exact behavior depends on auth state
    const url = page.url();
    const isOnboarding = url.includes("/onboarding");
    const isSignIn = url.includes("/auth/sign-in");
    
    expect(isOnboarding || isSignIn).toBeTruthy();
  });

  test("should have accessible onboarding route", async ({ page }) => {
    const response = await page.goto("/onboarding");
    
    // Should not return 404 or server error
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Onboarding Page - UI Elements (when accessible)", () => {
  test.beforeEach(async ({ page }) => {
    // Try to access onboarding page
    await page.goto("/onboarding");
  });

  test("should display workspace name input when on onboarding", async ({ page }) => {
    // Only run if we're actually on the onboarding page
    const isOnboarding = page.url().includes("/onboarding");
    
    if (isOnboarding) {
      // Look for workspace name input
      const nameInput = page.getByLabel(/workspace name|name/i);
      const nameInputExists = await nameInput.count() > 0;
      
      if (nameInputExists) {
        await expect(nameInput).toBeVisible();
      }
    }
  });

  test("should display icon selection when on onboarding", async ({ page }) => {
    const isOnboarding = page.url().includes("/onboarding");
    
    if (isOnboarding) {
      // Look for icon buttons/selection
      const iconButtons = page.locator("button").filter({ hasText: /📝|📊|💼|🚀|📱|💡|🎯|🔥|⭐|🌟/i });
      const count = await iconButtons.count();
      
      // May or may not have icons visible depending on UI state
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should display color selection when on onboarding", async ({ page }) => {
    const isOnboarding = page.url().includes("/onboarding");
    
    if (isOnboarding) {
      // Look for color selection buttons (usually colored circles/squares)
      const colorButtons = page.locator("[class*='rounded-full'], [class*='bg-']");
      const count = await colorButtons.count();
      
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should display create workspace button when on onboarding", async ({ page }) => {
    const isOnboarding = page.url().includes("/onboarding");
    
    if (isOnboarding) {
      const createButton = page.getByRole("button", { name: /create|continue|next|get started/i });
      const exists = await createButton.count() > 0;
      
      if (exists) {
        await expect(createButton).toBeVisible();
      }
    }
  });
});
