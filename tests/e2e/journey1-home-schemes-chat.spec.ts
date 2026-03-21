import { test, expect } from "@playwright/test";

test.describe("Journey 1 — Home → Schemes → Chat", () => {
  test("landing page loads with key sections", async ({ page }) => {
    await page.goto("/");

    // Hero section
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigation links present
    await expect(page.getByRole("link", { name: /schemes/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /upload/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /chat/i })).toBeVisible();

    // Stats bar / How It Works section exists
    await expect(page.locator("text=How It Works").or(page.locator("text=how it works"))).toBeVisible();
  });

  test("scheme browser loads all cards and filters work", async ({ page }) => {
    await page.goto("/schemes");

    // At least one scheme card visible
    const cards = page.locator("[data-testid='scheme-card']").or(
      page.locator(".card").filter({ hasText: /yojana|scheme|mission|program/i })
    );
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });

    // Search filters down results
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("awas");
      await expect(page.locator("text=PM Awas Yojana").or(page.locator("text=Awas"))).toBeVisible();
    }
  });

  test("scheme detail page loads for pm-awas-yojana", async ({ page }) => {
    await page.goto("/schemes/pm-awas-yojana");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Eligibility section exists
    await expect(
      page.locator("text=Eligibility").or(page.locator("text=eligibility"))
    ).toBeVisible();
  });

  test("chat page loads with input ready", async ({ page }) => {
    await page.goto("/chat");

    // Chat input is present
    const input = page.getByPlaceholder(/ask|type|message/i).or(
      page.locator("textarea")
    );
    await expect(input.first()).toBeVisible({ timeout: 10_000 });

    // Send button present
    await expect(
      page.getByRole("button", { name: /send/i }).or(page.locator("button[type='submit']"))
    ).toBeVisible();
  });

  test("navigating home → schemes → chat works via nav links", async ({ page }) => {
    await page.goto("/");

    // Click Schemes in nav
    await page.getByRole("link", { name: /schemes/i }).first().click();
    await expect(page).toHaveURL(/\/schemes/);

    // Click Chat in nav
    await page.getByRole("link", { name: /chat/i }).first().click();
    await expect(page).toHaveURL(/\/chat/);
  });
});
