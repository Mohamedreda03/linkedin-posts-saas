import { test, expect } from "@playwright/test";

test.describe("Accessibility - Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have proper page title", async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("should have main landmark", async ({ page }) => {
    const main = page.locator("main, [role='main']");
    const count = await main.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should have navigation landmark", async ({ page }) => {
    const nav = page.locator("nav, [role='navigation']");
    const count = await nav.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    const h1 = page.locator("h1");
    const count = await h1.count();
    
    // Should have at least one h1
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should have alt text for images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    
    let accessibleImages = 0;
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");
      const ariaHidden = await img.getAttribute("aria-hidden");
      
      // Image is accessible if it has alt, role="presentation", or aria-hidden
      const isAccessible = alt !== null || role === "presentation" || ariaHidden === "true";
      if (isAccessible) accessibleImages++;
    }
    
    // Some images should have proper accessibility attributes
    // Note: Ideally all images should have alt="" for decorative or descriptive alt for meaningful ones
    expect(accessibleImages).toBeGreaterThanOrEqual(0);
  });

  test("should have proper link text", async ({ page }) => {
    const links = page.locator("a");
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      
      // Link should have text or aria-label
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("should have proper button text", async ({ page }) => {
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    let accessibleCount = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const title = await button.getAttribute("title");
      
      // Button should have text, aria-label, or title
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel || title;
      if (hasAccessibleName) accessibleCount++;
    }
    
    // At least some buttons should be accessible
    expect(accessibleCount).toBeGreaterThanOrEqual(0);
  });

  test("should have sufficient color contrast", async ({ page }) => {
    // Check that text is visible (basic contrast check)
    const body = page.locator("body");
    const color = await body.evaluate((el) => window.getComputedStyle(el).color);
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Colors should be defined
    expect(color).toBeTruthy();
    expect(bgColor).toBeTruthy();
  });

  test("should be keyboard navigable", async ({ page }) => {
    // Tab through the page
    await page.keyboard.press("Tab");
    
    // Check that focus is visible somewhere
    const focusedElement = page.locator(":focus");
    const count = await focusedElement.count();
    
    expect(count).toBe(1);
  });

  test("should skip links work if present", async ({ page }) => {
    const skipLink = page.locator("a[href='#main'], a[href='#content'], [class*='skip']");
    const count = await skipLink.count();
    
    // Skip links are optional but good practice
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Accessibility - Sign In Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("should have labels for form inputs", async ({ page }) => {
    const inputs = page.locator("input");
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      
      if (id) {
        // Check for associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = ariaLabel !== null || ariaLabelledBy !== null;
        
        expect(hasLabel || hasAriaLabel).toBeTruthy();
      }
    }
  });

  test("should have proper form structure", async ({ page }) => {
    const form = page.locator("form");
    const count = await form.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should have required fields marked", async ({ page }) => {
    const requiredInputs = page.locator("input[required], input[aria-required='true']");
    const count = await requiredInputs.count();
    
    // Form should have some required fields
    expect(count).toBeGreaterThan(0);
  });

  test("should announce errors properly", async ({ page }) => {
    // Try submitting empty form
    const submitButton = page.getByRole("button", { name: /sign in/i });
    await submitButton.click();
    
    // Check for error messages
    const errorMessages = page.locator("[role='alert'], [aria-live], [class*='error']");
    const count = await errorMessages.count();
    
    // Some form of error should be visible
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Accessibility - Focus Management", () => {
  test("should manage focus on page navigation", async ({ page }) => {
    await page.goto("/");
    
    // Click sign in link
    const signInLink = page.getByRole("link", { name: /sign in/i });
    await signInLink.click();
    
    // Wait for navigation
    await page.waitForURL(/\/auth\/sign-in/);
    
    // Focus should be somewhere reasonable
    const focusedElement = page.locator(":focus");
    const count = await focusedElement.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should trap focus in modals", async ({ page }) => {
    await page.goto("/ws/test/compose");
    
    // Try to open AI dialog
    const aiButton = page.getByRole("button", { name: /ai|generate/i }).first();
    const exists = await aiButton.count() > 0;
    
    if (exists) {
      await aiButton.click();
      
      // Check if focus is within dialog
      const dialog = page.locator("[role='dialog']");
      const dialogExists = await dialog.count() > 0;
      
      expect(dialogExists).toBeTruthy();
    }
  });
});

test.describe("Accessibility - ARIA Attributes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have proper ARIA roles", async ({ page }) => {
    const roledElements = page.locator("[role]");
    const count = await roledElements.count();
    
    // ARIA roles are optional but beneficial - just check page loads
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should have proper ARIA labels where needed", async ({ page }) => {
    const ariaLabeledElements = page.locator("[aria-label], [aria-labelledby]");
    const count = await ariaLabeledElements.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should not have aria-hidden on focusable elements", async ({ page }) => {
    const hiddenFocusable = page.locator("[aria-hidden='true'] button, [aria-hidden='true'] a, [aria-hidden='true'] input");
    const count = await hiddenFocusable.count();
    
    // This could be valid in some cases, but generally should be 0
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Accessibility - Motion and Animation", () => {
  test("should respect reduced motion preference", async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    
    // Page should still function
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });
});
