import {expect, test} from "@playwright/test";

const baseUrl = "http://localhost:11334/index.html";

test.describe("WebUI smoke test", () => {
    test("should load WebUI and show main elements", async ({page}) => {
        await page.goto(baseUrl);

        // Wait for preloader to be hidden by JS when loading is complete
        await expect(page.locator("#preloader")).toBeHidden({timeout: 30000});
        // Wait for main UI class to be removed by JS
        await expect(page.locator("#mainUI")).not.toHaveClass("d-none", {timeout: 30000});
        await expect(page.locator("#mainUI")).toBeVisible();

        // Check main navigation elements
        await expect(page.locator("#navBar")).toBeVisible();
        await expect(page.locator("#tablist")).toBeVisible();

        // Check that at least one tab panel is visible
        await expect(page.locator(".tab-pane")).toHaveCount(7);
    });
});
