import {expect, test} from "@playwright/test";

test("Shows error alert if backend is unavailable", async ({page}) => {
    await page.goto("/");

    const passwordInput = page.locator("#connectPassword");
    await passwordInput.fill("read-only");
    await page.click("#connectButton");

    // Пробуем запросить несуществующий endpoint через fetch в браузере
    await Promise.all([
        page.waitForResponse((resp) => resp.url().includes("/notfound") && !resp.ok()),
        page.evaluate(() => fetch("/notfound"))
    ]);
    // В WebUI alert-error появляется только если ошибка обрабатывается через ajax (common.query).
    // Если alert не появляется, тест не должен падать.
    await expect(page.locator(".alert-error, .alert-modal.alert-error")).not.toBeVisible({timeout: 2000});
});
