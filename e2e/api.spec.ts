import { test, expect } from "@playwright/test";

test.describe("API Routes - Health Check", () => {
  test("should have accessible /api/generate-posts endpoint", async ({ request }) => {
    const response = await request.post("/api/generate-posts", {
      data: {},
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return error for missing data, but not 404
    expect(response.status()).not.toBe(404);
  });

  test("should have accessible /api/rewrite endpoint", async ({ request }) => {
    const response = await request.post("/api/rewrite", {
      data: {},
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return error for missing data, but not 404
    expect(response.status()).not.toBe(404);
  });

  test("should have accessible /api/linkedin/post endpoint", async ({ request }) => {
    const response = await request.post("/api/linkedin/post", {
      data: {},
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return error (401 or 400), but not 404
    expect(response.status()).not.toBe(404);
  });

  test("should have accessible /api/accounts endpoint", async ({ request }) => {
    const response = await request.get("/api/accounts");
    
    // Should return something (even if error), but not 404
    expect(response.status()).not.toBe(404);
  });

  test("should have accessible /api/workspaces endpoint", async ({ request }) => {
    const response = await request.get("/api/workspaces");
    
    // Should return something, but not 404
    expect(response.status()).not.toBe(404);
  });
});

test.describe("API Routes - Generate Posts", () => {
  test("should reject requests without topic", async ({ request }) => {
    const response = await request.post("/api/generate-posts", {
      data: {
        tone: "professional",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return 400 for missing topic
    expect(response.status()).toBe(400);
  });

  test("should accept valid generation request structure", async ({ request }) => {
    const response = await request.post("/api/generate-posts", {
      data: {
        topic: "AI and productivity",
        tone: "professional",
        dialect: "en-us",
        length: "medium",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // May fail without API key, but should accept the structure
    const status = response.status();
    // Either success (200) or internal error (500) due to missing API key, but not 400
    expect(status === 200 || status === 500 || status === 401).toBeTruthy();
  });
});

test.describe("API Routes - Rewrite", () => {
  test("should reject requests without content", async ({ request }) => {
    const response = await request.post("/api/rewrite", {
      data: {
        style: "improve",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return 400 for missing content
    expect(response.status()).toBe(400);
  });

  test("should accept valid rewrite request structure", async ({ request }) => {
    const response = await request.post("/api/rewrite", {
      data: {
        content: "This is a test post that needs to be rewritten.",
        style: "improve",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const status = response.status();
    // Either success or internal error due to API key
    expect(status === 200 || status === 500 || status === 401).toBeTruthy();
  });
});

test.describe("API Routes - LinkedIn Post", () => {
  test("should reject requests without required fields", async ({ request }) => {
    const response = await request.post("/api/linkedin/post", {
      data: {
        content: "Test post",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return error for missing userId, workspaceId, accountId
    const status = response.status();
    expect(status === 400 || status === 401).toBeTruthy();
  });

  test("should reject unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/linkedin/post", {
      data: {
        content: "Test post",
        userId: "test-user",
        workspaceId: "test-workspace",
        accountId: "test-account",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should return 401 or 400
    const status = response.status();
    expect(status === 400 || status === 401 || status === 500).toBeTruthy();
  });
});

test.describe("API Routes - Workspaces", () => {
  test("should return list or error for workspaces", async ({ request }) => {
    const response = await request.get("/api/workspaces");
    
    const status = response.status();
    // Either success with empty array, or auth error
    expect(status === 200 || status === 401 || status === 400).toBeTruthy();
  });

  test("should handle workspace creation without auth", async ({ request }) => {
    const response = await request.post("/api/workspaces", {
      data: {
        name: "Test Workspace",
        slug: "test-workspace",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Should require authentication
    const status = response.status();
    expect(status === 400 || status === 401 || status === 500).toBeTruthy();
  });
});

test.describe("API Routes - Accounts", () => {
  test("should handle account list request", async ({ request }) => {
    const response = await request.get("/api/accounts?workspaceId=test-workspace");
    
    const status = response.status();
    // Should return list or error
    expect(status < 500).toBeTruthy();
  });

  test("should handle account list with platform filter", async ({ request }) => {
    const response = await request.get("/api/accounts?workspaceId=test-workspace&platform=linkedin");
    
    const status = response.status();
    expect(status < 500).toBeTruthy();
  });
});
