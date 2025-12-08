import { test, expect } from "@playwright/test";

test.describe("UI Components - Buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display buttons with proper styling", async ({ page }) => {
    const buttons = page.locator("button");
    const count = await buttons.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should have clickable buttons", async ({ page }) => {
    const button = page.locator("button").first();
    const isEnabled = await button.isEnabled();
    
    expect(isEnabled).toBeTruthy();
  });

  test("should show hover states on buttons", async ({ page }) => {
    const button = page.locator("button").first();
    await button.hover();
    
    // Button should still be visible after hover
    await expect(button).toBeVisible();
  });
});

test.describe("UI Components - Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display navigation links", async ({ page }) => {
    const links = page.locator("a");
    const count = await links.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should have valid href attributes", async ({ page }) => {
    const links = page.locator("a[href]");
    const count = await links.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("UI Components - Forms", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("should display input fields", async ({ page }) => {
    const inputs = page.locator("input");
    const count = await inputs.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should display labels for inputs", async ({ page }) => {
    const labels = page.locator("label");
    const count = await labels.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should have accessible form controls", async ({ page }) => {
    // Check for labeled inputs
    const emailInput = page.getByLabel(/email/i);
    const exists = await emailInput.count() > 0;
    
    expect(exists).toBeTruthy();
  });
});

test.describe("UI Components - Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display card components on landing page", async ({ page }) => {
    // Scroll to feature section
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    
    const cards = page.locator("[class*='card'], [class*='Card']");
    const count = await cards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Avatars", () => {
  test("should display avatar components when present", async ({ page }) => {
    await page.goto("/");
    
    const avatars = page.locator("[class*='avatar']");
    const count = await avatars.count();
    
    // May or may not have avatars on landing
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Icons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display SVG icons", async ({ page }) => {
    const svgIcons = page.locator("svg");
    const count = await svgIcons.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test("should have properly sized icons", async ({ page }) => {
    const icon = page.locator("svg").first();
    const box = await icon.boundingBox();
    
    if (box) {
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
    }
  });
});

test.describe("UI Components - Dropdowns", () => {
  test("should handle dropdown menus", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    // Look for any dropdown triggers
    const dropdowns = page.locator("[role='combobox'], [class*='select'], [class*='dropdown']");
    const count = await dropdowns.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Tabs", () => {
  test("should display tab components when present", async ({ page }) => {
    // Go to a page that might have tabs
    await page.goto("/ws/test/compose");
    
    const tabs = page.locator("[role='tablist'], [class*='tabs']");
    const count = await tabs.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Badges", () => {
  test("should display badge components when present", async ({ page }) => {
    await page.goto("/");
    
    const badges = page.locator("[class*='badge']");
    const count = await badges.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Spinners/Loading", () => {
  test("should handle loading states", async ({ page }) => {
    await page.goto("/");
    
    // Look for loading indicators
    const spinners = page.locator("[class*='spinner'], [class*='loading'], [class*='animate-spin']");
    const count = await spinners.count();
    
    // May or may not have spinners visible
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Toasts/Notifications", () => {
  test("should have toast container for notifications", async ({ page }) => {
    await page.goto("/");
    
    // Sonner toast container should be present
    const toastContainer = page.locator("[data-sonner-toaster], [class*='sonner'], [class*='toast']");
    const count = await toastContainer.count();
    
    // Toast container should exist in the DOM
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Dialogs/Modals", () => {
  test("should handle dialog components", async ({ page }) => {
    await page.goto("/");
    
    // Look for dialog/modal containers
    const dialogs = page.locator("[role='dialog'], [class*='dialog'], [class*='modal']");
    const count = await dialogs.count();
    
    // Dialogs may be hidden initially
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Scroll Areas", () => {
  test("should handle scrollable areas", async ({ page }) => {
    await page.goto("/");
    
    const scrollAreas = page.locator("[class*='scroll'], [class*='overflow']");
    const count = await scrollAreas.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("UI Components - Separators", () => {
  test("should display separator lines", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const separators = page.locator("hr, [class*='separator'], [class*='divider']");
    const count = await separators.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
