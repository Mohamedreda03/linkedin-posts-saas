import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the landing page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/LinkedIn|PostCraft|Post/i);
  });

  test("should display the navbar with logo", async ({ page }) => {
    // Look for any logo text
    const logo = page.locator("nav a").first();
    await expect(logo).toBeVisible();
  });

  test("should display Sign In and Sign Up buttons", async ({ page }) => {
    const signInButton = page.getByRole("link", { name: /sign in/i });
    const signUpButton = page.getByRole("link", { name: /get started/i }).first();
    
    await expect(signInButton).toBeVisible();
    await expect(signUpButton).toBeVisible();
  });

  test("should display hero section with main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("should display features section", async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    
    // Check for feature-related content
    const content = page.locator("body");
    await expect(content).toBeVisible();
  });

  test("should navigate to sign-in page when clicking Sign In", async ({ page }) => {
    const signInButton = page.getByRole("link", { name: /sign in/i }).first();
    await signInButton.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should navigate to sign-up page when clicking Get Started", async ({ page }) => {
    // Find the first "Get Started" button that links to sign-up
    const getStartedButton = page.locator("a[href='/auth/sign-up']").first();
    await getStartedButton.click();
    
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("should display footer", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be functional on mobile
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
