import {expect, test} from "@playwright/test";

const baseUrl = "http://localhost:11334/";

test.describe("WebUI smoke test", () => {
    test("should load WebUI and show main elements", async ({page}) => {
        await page.goto(baseUrl);
        await expect(page.locator("body")).toBeVisible();
        // Проверяем наличие элементов, специфичных для WebUI
        await expect(page.locator("header, .navbar, #main")).toHaveCount(1);
    });
});
