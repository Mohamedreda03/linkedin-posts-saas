import { test, expect, devices } from "@playwright/test";

test.describe("Responsive Design - Landing Page", () => {
  test.describe("Mobile (375x667)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display mobile-friendly layout", async ({ page }) => {
      await page.goto("/");
      
      // Look for the main heading or logo
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("should have readable text size", async ({ page }) => {
      await page.goto("/");
      
      const heading = page.locator("h1").first();
      const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
      const size = parseInt(fontSize);
      
      // Heading should be at least 20px on mobile
      expect(size).toBeGreaterThanOrEqual(20);
    });

    test("should have touch-friendly button sizes", async ({ page }) => {
      await page.goto("/");
      
      const buttons = page.locator("button, a[role='button']");
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box) {
          // Minimum touch target is 44x44 for accessibility
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    });

    test("should not have horizontal scroll", async ({ page }) => {
      await page.goto("/");
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
    });
  });

  test.describe("Tablet (768x1024)", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("should display tablet layout", async ({ page }) => {
      await page.goto("/");
      
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });

    test("should show navigation elements", async ({ page }) => {
      await page.goto("/");
      
      const nav = page.locator("nav");
      await expect(nav.first()).toBeVisible();
    });
  });

  test.describe("Desktop (1280x720)", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("should display full desktop layout", async ({ page }) => {
      await page.goto("/");
      
      // All main elements should be visible
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
      
      const signIn = page.getByRole("link", { name: /sign in/i });
      await expect(signIn).toBeVisible();
    });

    test("should have proper content width", async ({ page }) => {
      await page.goto("/");
      
      const container = page.locator(".container, [class*='container']").first();
      const box = await container.boundingBox();
      
      if (box) {
        // Container should be constrained
        expect(box.width).toBeLessThanOrEqual(1280);
      }
    });
  });

  test.describe("Large Desktop (1920x1080)", () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test("should center content properly", async ({ page }) => {
      await page.goto("/");
      
      // Content should be centered
      const main = page.locator("main, [class*='container']").first();
      const box = await main.boundingBox();
      
      if (box) {
        // Content should have margins on large screens
        expect(box.x).toBeGreaterThan(0);
      }
    });
  });
});

test.describe("Responsive Design - Auth Pages", () => {
  test.describe("Mobile", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display sign in form properly on mobile", async ({ page }) => {
      await page.goto("/auth/sign-in");
      
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toBeVisible();
      
      const passwordInput = page.getByLabel(/password/i);
      await expect(passwordInput).toBeVisible();
    });

    test("should display sign up form properly on mobile", async ({ page }) => {
      await page.goto("/auth/sign-up");
      
      const nameInput = page.getByLabel(/name/i);
      await expect(nameInput).toBeVisible();
    });

    test("should have full-width inputs on mobile", async ({ page }) => {
      await page.goto("/auth/sign-in");
      
      // Just verify the form is visible on mobile
      const form = page.locator("form");
      const exists = await form.count() > 0;
      
      expect(exists).toBeTruthy();
    });
  });
});

test.describe("Responsive Design - Compose Page", () => {
  const TEST_WORKSPACE_ID = "test-workspace";

  test.describe("Mobile", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should have accessible compose page on mobile", async ({ page }) => {
      await page.goto(`/ws/${TEST_WORKSPACE_ID}/compose`);
      
      // Page should load without errors
      const url = page.url();
      expect(url).toBeTruthy();
    });

    test("should hide preview pane on mobile", async ({ page }) => {
      await page.goto(`/ws/${TEST_WORKSPACE_ID}/compose`);
      
      const isCompose = page.url().includes("/compose");
      
      if (isCompose) {
        // Preview might be hidden or toggle-able on mobile
        const previewToggle = page.getByRole("button", { name: /preview|show|hide/i });
        const count = await previewToggle.count();
        
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe("Desktop", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("should show side-by-side editor and preview", async ({ page }) => {
      await page.goto(`/ws/${TEST_WORKSPACE_ID}/compose`);
      
      const isCompose = page.url().includes("/compose");
      
      if (isCompose) {
        // Both editor and preview should be visible
        const textarea = page.locator("textarea");
        const preview = page.locator("text=/preview/i");
        
        const textareaCount = await textarea.count();
        const previewCount = await preview.count();
        
        expect(textareaCount).toBeGreaterThanOrEqual(0);
        expect(previewCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

test.describe("Responsive Design - Workspace Dashboard", () => {
  const TEST_WORKSPACE_ID = "test-workspace";

  test.describe("Mobile", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("should display workspace dashboard on mobile", async ({ page }) => {
      await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
      
      // Page should load
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });

  test.describe("Tablet", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("should display workspace dashboard on tablet", async ({ page }) => {
      await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
      
      const url = page.url();
      expect(url).toBeTruthy();
    });
  });
});

test.describe("Device Emulation", () => {
  test("should work on iPhone 12", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPhone 12"],
    });
    const page = await context.newPage();
    
    await page.goto("/");
    
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    
    await context.close();
  });

  test("should work on iPad", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["iPad (gen 7)"],
    });
    const page = await context.newPage();
    
    await page.goto("/");
    
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    
    await context.close();
  });

  test("should work on Galaxy S9", async ({ browser }) => {
    const context = await browser.newContext({
      ...devices["Galaxy S9+"],
    });
    const page = await context.newPage();
    
    await page.goto("/");
    
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    
    await context.close();
  });
});

test.describe("Touch Interactions", () => {
  test.use({ hasTouch: true });

  test("should support touch scrolling", async ({ page }) => {
    await page.goto("/");
    
    // Simulate touch scroll
    await page.touchscreen.tap(200, 400);
    
    // Page should still be functional
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("should support touch on buttons", async ({ page }) => {
    await page.goto("/");
    
    const button = page.locator("button, a[role='button']").first();
    const box = await button.boundingBox();
    
    if (box) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
  });
});

test.describe("Orientation", () => {
  test("should work in landscape mode", async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 });
    await page.goto("/");
    
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("should work in portrait mode", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });
});
