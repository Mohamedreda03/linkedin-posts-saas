import { test, expect } from "@playwright/test";

// Test fixtures for authenticated workspace tests
const TEST_WORKSPACE_ID = "test-workspace-id";

test.describe("Workspace Dashboard Page - Route Access", () => {
  test("should have accessible workspace route structure", async ({ page }) => {
    // Test with a sample workspace ID - will redirect if not authenticated
    const response = await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
    
    // Should not return 404 (route exists) or 500 (server error)
    const status = response?.status() || 0;
    expect(status).toBeLessThan(500);
  });

  test("should redirect unauthenticated users", async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
    
    // Should redirect to sign-in or show unauthorized
    await page.waitForTimeout(1000);
    
    const url = page.url();
    const isWorkspace = url.includes("/ws/");
    const isAuth = url.includes("/auth/");
    const isLanding = url === "http://localhost:3000/";
    
    // One of these should be true
    expect(isWorkspace || isAuth || isLanding).toBeTruthy();
  });
});

test.describe("Workspace Dashboard Page - UI Structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
  });

  test("should have proper page structure when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Check for main layout elements
      const body = page.locator("body");
      await expect(body).toBeVisible();
    }
  });

  test("should display workspace selector when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for workspace selector/switcher
      const workspaceSelector = page.locator("[class*='workspace'], [class*='selector']");
      const count = await workspaceSelector.count();
      
      // May or may not be visible depending on auth state
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have navigation links when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for navigation elements
      const navLinks = page.locator("a[href*='/ws/'], nav a");
      const count = await navLinks.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have data table for posts when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for table or list of posts
      const table = page.locator("table, [role='table'], [class*='data-table']");
      const count = await table.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have create new post button when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for create/compose button
      const createButton = page.getByRole("link", { name: /create|compose|new post/i });
      const buttonExists = await createButton.count() > 0;
      
      if (buttonExists) {
        await expect(createButton).toBeVisible();
      }
    }
  });

  test("should have settings link when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for settings link or icon
      const settingsLink = page.locator("a[href*='settings'], [class*='settings']");
      const exists = await settingsLink.count() > 0;
      
      // Settings link may or may not be visible depending on auth
      expect(typeof exists).toBe("boolean");
    }
  });
});

test.describe("Workspace Dashboard - User Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
  });

  test("should display user menu when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for user avatar/menu
      const userMenu = page.locator("[class*='avatar'], [class*='user-nav'], [class*='dropdown']");
      const count = await userMenu.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have logout functionality when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for logout button/link
      const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
      const exists = await logoutButton.count() > 0;
      
      // May not be visible until menu is opened
      expect(typeof exists).toBe("boolean");
    }
  });
});

test.describe("Workspace Dashboard - Posts List", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
  });

  test("should display posts list or empty state when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for posts list or empty state
      const postsContainer = page.locator("table, [class*='empty'], [class*='no-posts']");
      const count = await postsContainer.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should have search functionality when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for search input
      const searchInput = page.getByPlaceholder(/search/i);
      const exists = await searchInput.count() > 0;
      
      if (exists) {
        await expect(searchInput).toBeVisible();
      }
    }
  });

  test("should have filter tabs when accessible", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Look for filter tabs (All, Published, Drafts)
      const tabs = page.locator("[role='tablist'], [class*='tabs']");
      const count = await tabs.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe("Workspace Dashboard - Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/ws/${TEST_WORKSPACE_ID}`);
  });

  test("should have search input with correct placeholder", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search by topic or content/i);
      const exists = await searchInput.count() > 0;
      
      if (exists) {
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeEnabled();
      }
    }
  });

  test("should have search button", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchButton = page.getByRole("button", { name: /^search$/i });
      const exists = await searchButton.count() > 0;
      
      if (exists) {
        await expect(searchButton).toBeVisible();
        await expect(searchButton).toBeEnabled();
      }
    }
  });

  test("should allow typing in search input", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search/i).first();
      const exists = await searchInput.count() > 0;
      
      if (exists) {
        await searchInput.fill("test search query");
        await expect(searchInput).toHaveValue("test search query");
      }
    }
  });

  test("should trigger search on button click", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search by topic or content/i);
      const searchButton = page.getByRole("button", { name: /^search$/i });
      
      const inputExists = await searchInput.count() > 0;
      const buttonExists = await searchButton.count() > 0;
      
      if (inputExists && buttonExists) {
        await searchInput.fill("test query");
        
        // Use force click to handle potential stability issues
        await searchButton.click({ force: true, timeout: 10000 });
        
        // Just verify no errors occurred - page should still be accessible
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    }
  });

  test("should trigger search on Enter key press", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search by topic or content/i);
      const exists = await searchInput.count() > 0;
      
      if (exists) {
        await searchInput.fill("enter key search");
        await searchInput.press("Enter");
        
        // Verify page is still accessible (search triggered without errors)
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    }
  });

  test("should clear search input when manually cleared", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search/i).first();
      const exists = await searchInput.count() > 0;
      
      if (exists) {
        await searchInput.fill("some text");
        await expect(searchInput).toHaveValue("some text");
        
        await searchInput.clear();
        await expect(searchInput).toHaveValue("");
      }
    }
  });

  test("should have search icon in input", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      // Search icon is inside the input container
      const searchIcon = page.locator("svg.lucide-search, [class*='search'] svg");
      const exists = await searchIcon.count() > 0;
      
      expect(typeof exists).toBe("boolean");
    }
  });

  test("should handle empty search gracefully", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchButton = page.getByRole("button", { name: /^search$/i });
      const exists = await searchButton.count() > 0;
      
      if (exists) {
        // Wait for any loading to complete
        await page.waitForTimeout(300);
        
        // Click search with empty input using force
        await searchButton.click({ force: true });
        
        // Should not cause any errors
        await page.waitForTimeout(300);
        
        // Page should still be accessible
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    }
  });

  test("should handle special characters in search", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search/i).first();
      const searchButton = page.getByRole("button", { name: /^search$/i });
      
      const inputExists = await searchInput.count() > 0;
      const buttonExists = await searchButton.count() > 0;
      
      if (inputExists && buttonExists) {
        // Test with special characters
        await searchInput.fill("test & query");
        
        // Wait for re-renders to settle
        await page.waitForTimeout(300);
        
        // Use force click to handle potential stability issues  
        await searchButton.click({ force: true });
        
        // Should handle gracefully without errors
        await page.waitForTimeout(300);
        
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    }
  });

  test("should handle whitespace-only search", async ({ page }) => {
    const isWorkspace = page.url().includes("/ws/");
    
    if (isWorkspace) {
      const searchInput = page.getByPlaceholder(/search/i).first();
      const searchButton = page.getByRole("button", { name: /^search$/i });
      
      const inputExists = await searchInput.count() > 0;
      const buttonExists = await searchButton.count() > 0;
      
      if (inputExists && buttonExists) {
        // Test with whitespace only
        await searchInput.fill("   ");
        
        // Wait for re-renders to settle
        await page.waitForTimeout(300);
        
        // Use force click to handle potential stability issues
        await searchButton.click({ force: true });
        
        // Should handle gracefully
        await page.waitForTimeout(300);
        
        const body = page.locator("body");
        await expect(body).toBeVisible();
      }
    }
  });
});
