import fs from "node:fs";
import { expect, test } from "@playwright/test";

test.describe("Transparencia Page @smoke", () => {
  test("should sync filters with URL and export CSV", async ({ page }) => {
    await page.goto("/transparencia?year=2026&month=3&category=comunicacao");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /transparência|transparencia/i })).toBeVisible();

    const monthSelect = page.locator("#filtro-mes");
    const yearSelect = page.locator("#filtro-ano");
    const categorySelect = page.locator("#filtro-categoria");

    await expect(monthSelect).toHaveValue("03");
    await expect(yearSelect).toHaveValue("2026");
    await expect(categorySelect).toHaveValue("comunicacao");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /baixar csv/i }).click();
    const download = await downloadPromise;
    const downloadPath = await download.path();

    expect(download.suggestedFilename()).toContain("gastos_transparencia_2026_03_comunicacao");
    expect(downloadPath).toBeTruthy();

    const csvContent = await fs.promises.readFile(downloadPath!, "utf8");
    expect(csvContent.split(/\r?\n/, 1)[0]).toBe("occurred_on,vendor,category,amount,description,document_url");

    await categorySelect.selectOption("equipamentos");
    await expect(page).toHaveURL(/\/transparencia\?[^#]*year=2026/);
    await expect(page).toHaveURL(/\/transparencia\?[^#]*month=03/);
    await expect(page).toHaveURL(/\/transparencia\?[^#]*category=equipamentos/);
  });
});
