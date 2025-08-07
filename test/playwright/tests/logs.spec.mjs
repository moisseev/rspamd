import {expect, test} from "@playwright/test";

test("Logs page displays recent errors and allows refresh", async ({page}, testInfo) => {
    const {enablePassword} = testInfo.project.use.rspamdPasswords;

    await page.goto("/");

    const passwordInput = page.locator("#connectPassword");
    await passwordInput.fill(enablePassword);
    await page.click("#connectButton");

    await page.click("#history_nav");
    // Проверяем наличие таблицы ошибок
    await expect(page.locator("#errorsLog")).toBeVisible();
    // Проверяем, что есть хотя бы одна строка (кроме заголовка)
    const rowCount = await page.locator("#errorsLog tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
    // Проверяем кнопку обновления
    await page.click("#updateErrors");
    // После обновления таблица должна быть видимой
    await expect(page.locator("#errorsLog")).toBeVisible();
});
