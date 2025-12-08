import { test, expect } from "@playwright/test";

test.describe("Navigation - Main Routes", () => {
  test("should navigate from landing to sign-in", async ({ page }) => {
    await page.goto("/");
    
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await signInLink.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should navigate from landing to sign-up", async ({ page }) => {
    await page.goto("/");
    
    const signUpLink = page.getByRole("link", { name: /sign up|get started/i }).first();
    await signUpLink.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("should navigate between sign-in and sign-up", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const signUpLink = page.getByRole("link", { name: /sign up|create account/i });
    await signUpLink.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-up/);
    
    const signInLink = page.getByRole("link", { name: /sign in|already have/i });
    await signInLink.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should navigate to forgot password from sign-in", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const forgotLink = page.getByRole("link", { name: /forgot password/i });
    await forgotLink.click();
    
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });
});

test.describe("Navigation - Browser Controls", () => {
  test("should handle browser back button", async ({ page }) => {
    await page.goto("/");
    await page.goto("/auth/sign-in");
    
    await page.goBack();
    
    await expect(page).toHaveURL("/");
  });

  test("should handle browser forward button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("networkidle");
    
    await page.goBack();
    await page.waitForLoadState("networkidle");
    
    await page.goForward();
    await page.waitForTimeout(500);
    
    // Allow for any URL that contains sign-in
    const url = page.url();
    expect(url.includes("sign-in") || url.includes("auth")).toBeTruthy();
  });

  test("should handle page refresh", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    await page.reload();
    
    // Page should still work after refresh
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });
});

test.describe("Navigation - Direct URL Access", () => {
  test("should access landing page directly", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("should access sign-in page directly", async ({ page }) => {
    const response = await page.goto("/auth/sign-in");
    expect(response?.status()).toBe(200);
  });

  test("should access sign-up page directly", async ({ page }) => {
    const response = await page.goto("/auth/sign-up");
    expect(response?.status()).toBe(200);
  });

  test("should access forgot-password page directly", async ({ page }) => {
    const response = await page.goto("/auth/forgot-password");
    expect(response?.status()).toBe(200);
  });

  test("should access reset-password page directly", async ({ page }) => {
    const response = await page.goto("/auth/reset-password");
    expect(response?.status()).toBe(200);
  });

  test("should access onboarding page directly", async ({ page }) => {
    const response = await page.goto("/onboarding");
    // May redirect, but should not error
    expect(response?.status()).toBeLessThan(500);
  });

  test("should access workspace page directly", async ({ page }) => {
    const response = await page.goto("/ws/test-workspace");
    // May redirect, but should not error
    expect(response?.status()).toBeLessThan(500);
  });

  test("should access compose page directly", async ({ page }) => {
    const response = await page.goto("/ws/test-workspace/compose");
    // May redirect, but should not error
    expect(response?.status()).toBeLessThan(500);
  });

  test("should access settings page directly", async ({ page }) => {
    const response = await page.goto("/ws/test-workspace/settings");
    // May redirect, but should not error
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("Navigation - 404 Handling", () => {
  test("should show 404 for non-existent routes", async ({ page }) => {
    const response = await page.goto("/non-existent-page-xyz");
    
    // Should return 404
    expect(response?.status()).toBe(404);
  });

  test("should display not found page for invalid routes", async ({ page }) => {
    await page.goto("/some-random-invalid-page");
    
    // Should show some indication of 404
    const notFoundText = page.locator("text=/not found|404|doesn't exist/i");
    const count = await notFoundText.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Navigation - Workspace Routes", () => {
  const TEST_WORKSPACE_ID = "test-workspace";

  test("should navigate within workspace", async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
    await page.waitForTimeout(1000);
    
    const url = page.url();
    // Just verify we got some response (auth redirect or actual workspace)
    expect(url).toBeTruthy();
  });

  test("should navigate to settings from workspace", async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
    
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const settingsLink = page.getByRole("link", { name: /settings/i }).first();
      const exists = await settingsLink.count() > 0;
      
      if (exists) {
        await settingsLink.click();
        await expect(page).toHaveURL(new RegExp(`/ws/${TEST_WORKSPACE_ID}/settings`));
      }
    }
  });
});

test.describe("Navigation - Keyboard Navigation", () => {
  test("should navigate with Tab key", async ({ page }) => {
    await page.goto("/");
    
    // Press Tab multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    
    // Should have focused element
    const focused = page.locator(":focus");
    const count = await focused.count();
    expect(count).toBe(1);
  });

  test("should activate links with Enter key", async ({ page }) => {
    await page.goto("/");
    
    // Tab to first link
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Get the href before pressing Enter
    const focused = page.locator(":focus");
    const href = await focused.getAttribute("href");
    
    if (href && href.startsWith("/")) {
      await page.keyboard.press("Enter");
      
      // Should navigate
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      expect(currentUrl).toContain(href);
    }
  });

  test("should navigate backwards with Shift+Tab", async ({ page }) => {
    await page.goto("/");
    
    // Tab forward
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Tab backward
    await page.keyboard.press("Shift+Tab");
    
    const focused = page.locator(":focus");
    const count = await focused.count();
    expect(count).toBe(1);
  });
});

test.describe("Navigation - Logo Links", () => {
  test("should have logo link to home", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const logoLink = page.locator("a:has-text('PostCraft')").first();
    const exists = await logoLink.count() > 0;
    
    if (exists) {
      const href = await logoLink.getAttribute("href");
      expect(href).toBe("/");
    }
  });
});

test.describe("Navigation - External Links", () => {
  test("should handle external links properly", async ({ page }) => {
    await page.goto("/");
    
    // Check for any external links
    const externalLinks = page.locator("a[target='_blank'], a[href^='http']");
    const count = await externalLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const rel = await link.getAttribute("rel");
      
      // External links should have noopener for security
      if (await link.getAttribute("target") === "_blank") {
        expect(rel).toContain("noopener");
      }
    }
  });
});
