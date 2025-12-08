import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-in");
  });

  test("should display sign in page with form elements", async ({ page }) => {
    // Check for page heading
    const heading = page.getByRole("heading", { name: /sign in|welcome back/i });
    await expect(heading).toBeVisible();

    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();

    // Check for sign in button
    const signInButton = page.getByRole("button", { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test("should have link to sign up page", async ({ page }) => {
    const signUpLink = page.getByRole("link", { name: /sign up|create account/i });
    await expect(signUpLink).toBeVisible();
  });

  test("should have link to forgot password page", async ({ page }) => {
    const forgotPasswordLink = page.getByRole("link", { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeVisible();
  });

  test("should show validation error for empty form submission", async ({ page }) => {
    const signInButton = page.getByRole("button", { name: /sign in/i });
    await signInButton.click();

    // Check for HTML5 validation or custom error message
    const emailInput = page.getByLabel(/email/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("invalid-email");

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill("password123");

    const signInButton = page.getByRole("button", { name: /sign in/i });
    await signInButton.click();

    // Check for HTML5 validation
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    const forgotPasswordLink = page.getByRole("link", { name: /forgot password/i });
    await forgotPasswordLink.click();

    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });

  test("should navigate to sign up page", async ({ page }) => {
    const signUpLink = page.getByRole("link", { name: /sign up|create account/i });
    await signUpLink.click();

    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test("should allow typing in email and password fields", async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill("password123");
    await expect(passwordInput).toHaveValue("password123");
  });

  test("should have password field with type password", async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});

test.describe("Sign Up Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/sign-up");
  });

  test("should display sign up page with form elements", async ({ page }) => {
    // Check for page heading
    const heading = page.getByRole("heading", { name: /sign up|create.*account|get started/i });
    await expect(heading).toBeVisible();

    // Check for name input
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toBeVisible();

    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Check for password input
    const passwordInput = page.getByLabel(/password/i).first();
    await expect(passwordInput).toBeVisible();

    // Check for sign up button
    const signUpButton = page.getByRole("button", { name: "Create Account" });
    await expect(signUpButton).toBeVisible();
  });

  test("should have link to sign in page", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: /sign in|already have/i });
    await expect(signInLink).toBeVisible();
  });

  test("should navigate to sign in page", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: /sign in|already have/i });
    await signInLink.click();

    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("should allow typing in all form fields", async ({ page }) => {
    const nameInput = page.getByLabel(/name/i);
    await nameInput.fill("John Doe");
    await expect(nameInput).toHaveValue("John Doe");

    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("john@example.com");
    await expect(emailInput).toHaveValue("john@example.com");

    const passwordInput = page.getByLabel(/password/i).first();
    await passwordInput.fill("password123");
    await expect(passwordInput).toHaveValue("password123");
  });

  test("should show validation for empty form submission", async ({ page }) => {
    const signUpButton = page.getByRole("button", { name: "Create Account" });
    await signUpButton.click();

    // Check for HTML5 validation
    const nameInput = page.getByLabel(/name/i);
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });
});

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/forgot-password");
  });

  test("should display forgot password page with form elements", async ({ page }) => {
    // Check for page heading
    const heading = page.getByRole("heading", { name: /forgot password|reset/i });
    await expect(heading).toBeVisible();

    // Check for email input
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Check for submit button
    const submitButton = page.getByRole("button", { name: /send|reset|submit/i });
    await expect(submitButton).toBeVisible();
  });

  test("should have link back to sign in", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: /sign in|back|remember/i });
    await expect(signInLink).toBeVisible();
  });

  test("should allow entering email", async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill("test@example.com");
    await expect(emailInput).toHaveValue("test@example.com");
  });
});

test.describe("Reset Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/reset-password");
  });

  test("should display reset password page", async ({ page }) => {
    // Check for page heading
    const heading = page.getByRole("heading", { name: /reset password|new password/i });
    await expect(heading).toBeVisible();
  });

  test("should display password fields", async ({ page }) => {
    // Check for password inputs
    const passwordInputs = page.locator("input[type='password']");
    const count = await passwordInputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should have submit button", async ({ page }) => {
    const submitButton = page.getByRole("button", { name: /reset|update|submit|save/i });
    await expect(submitButton).toBeVisible();
  });
});
