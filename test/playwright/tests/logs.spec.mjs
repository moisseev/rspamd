import {expect, test} from "@playwright/test";
import {login} from "../helpers/auth.mjs";

test("Logs page displays recent errors and allows refresh", async ({page}, testInfo) => {
    const {enablePassword} = testInfo.project.use.rspamdPasswords;

    await login(page, enablePassword);

    await page.locator("#history_nav").click();
    // Проверяем наличие таблицы ошибок
    await expect(page.locator("#errorsLog")).toBeVisible();
    // Проверяем, что есть хотя бы одна строка (кроме заголовка)
    const rowCount = await page.locator("#errorsLog tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
    // Проверяем кнопку обновления
    await page.locator("#updateErrors").click();
    // После обновления таблица должна быть видимой
    await expect(page.locator("#errorsLog")).toBeVisible();
});
