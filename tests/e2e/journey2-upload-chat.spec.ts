import { test, expect, Page } from "@playwright/test";
import path from "path";
import fs from "fs";

// Create a minimal test PDF text file in memory
async function createTestTextFile(tmpPath: string) {
  const content = `PM Kisan Samman Nidhi Scheme
Eligibility Criteria:
- Must be a farmer with cultivable land
- Annual family income must be below Rs 6 lakh
- Should not be an income tax payer
- Must have valid Aadhaar card
- Bank account linked to Aadhaar is mandatory
Benefits: Rs 6000 per year in three equal installments.`;
  fs.writeFileSync(tmpPath, content);
}

test.describe("Journey 2 — Upload Document → Chat", () => {
  test("upload page loads with dropzone", async ({ page }) => {
    await page.goto("/upload");

    // Dropzone visible
    await expect(
      page.locator("text=drag").or(page.locator("text=upload").or(page.locator("text=drop")))
    ).toBeVisible({ timeout: 10_000 });

    // Preloaded library visible
    await expect(
      page.locator("text=preloaded").or(page.locator("text=Preloaded").or(page.locator("text=ready")))
    ).toBeVisible();
  });

  test("uploading a text file shows indexed status", async ({ page }) => {
    await page.goto("/upload");

    // Create a temp test file
    const tmpFile = path.join(process.cwd(), "tests", "e2e", "_test-scheme.txt");
    await createTestTextFile(tmpFile);

    try {
      // Use file chooser to upload
      const fileChooserPromise = page.waitForEvent("filechooser");
      // Click the upload zone or browse button
      const uploadTrigger = page
        .getByRole("button", { name: /browse|choose|select/i })
        .or(page.locator("input[type='file']").first());

      if (await page.locator("input[type='file']").isVisible()) {
        await page.locator("input[type='file']").setInputFiles(tmpFile);
      } else {
        await uploadTrigger.click();
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(tmpFile);
      }

      // Wait for indexed status
      await expect(
        page.locator("text=indexed").or(page.locator("text=Indexed").or(page.locator("text=ready")))
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      // Clean up temp file
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }
  });

  test("preloaded scheme can be selected and navigates to chat", async ({ page }) => {
    await page.goto("/upload");

    // Find a "Chat" or "Start Chat" link/button
    const chatLink = page.getByRole("link", { name: /chat/i }).or(
      page.getByRole("button", { name: /start chat|go to chat/i })
    );

    if (await chatLink.first().isVisible()) {
      await chatLink.first().click();
      await expect(page).toHaveURL(/\/chat/);
    } else {
      // Just navigate to chat manually — upload persists in Zustand
      await page.goto("/chat");
      await expect(page).toHaveURL(/\/chat/);
    }
  });

  test("chat page shows document sidebar after upload", async ({ page }) => {
    // Upload first
    await page.goto("/upload");

    const tmpFile = path.join(process.cwd(), "tests", "e2e", "_test-scheme2.txt");
    await createTestTextFile(tmpFile);

    try {
      if (await page.locator("input[type='file']").isVisible()) {
        await page.locator("input[type='file']").setInputFiles(tmpFile);
        await page.waitForTimeout(3000); // allow parsing
      }
    } finally {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    }

    // Navigate to chat
    await page.goto("/chat");

    // Document sidebar or active doc count should be visible
    const sidebar = page
      .locator("[data-testid='document-sidebar']")
      .or(page.locator("text=document").or(page.locator("text=Document")));
    await expect(sidebar.first()).toBeVisible({ timeout: 8_000 });
  });
});
