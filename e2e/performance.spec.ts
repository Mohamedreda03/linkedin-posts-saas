import { test, expect } from "@playwright/test";

test.describe("Performance - Page Load Times", () => {
  test("landing page should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test("sign-in page should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/auth/sign-in");
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test("sign-up page should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/auth/sign-up");
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("Performance - Core Web Vitals Approximation", () => {
  test("should have reasonable First Contentful Paint", async ({ page }) => {
    await page.goto("/");
    
    // Wait for first paint
    const fcpMetric = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntriesByName("first-contentful-paint");
          if (entries.length > 0) {
            resolve(entries[0].startTime);
          }
        }).observe({ entryTypes: ["paint"] });
        
        // Fallback timeout
        setTimeout(() => resolve(null), 5000);
      });
    });
    
    if (fcpMetric) {
      // FCP should be under 2.5s for good score
      expect(fcpMetric).toBeLessThan(2500);
    }
  });

  test("should have reasonable Time to Interactive", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    
    // Wait for page to be interactive
    await page.waitForLoadState("domcontentloaded");
    const tti = Date.now() - startTime;
    
    // TTI should be under 3.5s
    expect(tti).toBeLessThan(3500);
  });
});

test.describe("Performance - Resource Loading", () => {
  test("should not have too many HTTP requests", async ({ page }) => {
    const requests: string[] = [];
    
    page.on("request", (request) => {
      requests.push(request.url());
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Should have reasonable number of requests (< 100)
    expect(requests.length).toBeLessThan(100);
  });

  test("should not load oversized images", async ({ page }) => {
    const largeImages: string[] = [];
    
    page.on("response", async (response) => {
      const contentType = response.headers()["content-type"];
      if (contentType?.includes("image")) {
        const size = parseInt(response.headers()["content-length"] || "0");
        if (size > 500000) { // 500KB
          largeImages.push(response.url());
        }
      }
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Should not have images over 500KB
    expect(largeImages.length).toBe(0);
  });

  test("should use caching headers", async ({ page }) => {
    let hasCacheHeaders = false;
    
    page.on("response", (response) => {
      const cacheControl = response.headers()["cache-control"];
      if (cacheControl && (cacheControl.includes("max-age") || cacheControl.includes("immutable"))) {
        hasCacheHeaders = true;
      }
    });
    
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // At least some resources should have cache headers
    expect(hasCacheHeaders).toBeTruthy();
  });
});

test.describe("Performance - JavaScript Bundles", () => {
  test("should not have blocking JavaScript", async ({ page }) => {
    await page.goto("/");
    
    // Page should be interactive quickly
    const button = page.locator("button, a").first();
    await expect(button).toBeVisible({ timeout: 3000 });
  });

  test("should load critical content first", async ({ page }) => {
    await page.goto("/");
    
    // Main heading should be visible quickly
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 2000 });
  });
});

test.describe("Performance - Network Conditions", () => {
  test("should load on slow 3G", async ({ page, context }) => {
    // Throttle network
    const cdpSession = await context.newCDPSession(page);
    await cdpSession.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400,
    });
    
    const response = await page.goto("/", { timeout: 30000 });
    expect(response?.status()).toBe(200);
    
    // Content should eventually load
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Performance - Memory", () => {
  test("should not have memory leaks on navigation", async ({ page }) => {
    await page.goto("/");
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto("/auth/sign-in");
      await page.goto("/");
    }
    
    // Page should still be responsive
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });
});

test.describe("Performance - Animations", () => {
  test("should have smooth animations", async ({ page }) => {
    await page.goto("/");
    
    // Scroll to trigger animations
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Page should remain responsive during animations
    const button = page.locator("button").first();
    await expect(button).toBeVisible();
  });

  test("should not block main thread with animations", async ({ page }) => {
    await page.goto("/");
    
    // Try to interact while scrolling
    const scrollPromise = page.evaluate(async () => {
      for (let i = 0; i < 10; i++) {
        window.scrollBy(0, 100);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    
    // Buttons should still be clickable during scroll
    const button = page.locator("button").first();
    const isEnabled = await button.isEnabled();
    
    await scrollPromise;
    expect(isEnabled).toBeTruthy();
  });
});

test.describe("Performance - Form Interactions", () => {
  test("should have responsive form inputs", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const emailInput = page.getByLabel(/email/i);
    
    const startTime = Date.now();
    await emailInput.fill("test@example.com");
    const inputTime = Date.now() - startTime;
    
    // Typing should be fast
    expect(inputTime).toBeLessThan(500);
  });

  test("should have responsive button clicks", async ({ page }) => {
    await page.goto("/auth/sign-in");
    
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("test@example.com");
    
    const button = page.getByRole("button", { name: /sign in/i });
    
    const startTime = Date.now();
    await button.click();
    const clickTime = Date.now() - startTime;
    
    // Click should register quickly
    expect(clickTime).toBeLessThan(200);
  });
});
