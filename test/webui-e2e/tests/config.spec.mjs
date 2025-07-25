import {expect, test} from "@playwright/test";

test("Config page allows changing action threshold and saving", async ({page}) => {
    await page.goto("http://localhost:11334");
    await page.click("#configuration_nav");
    // Проверяем наличие формы действий
    await expect(page.locator("#actionsFormField")).toBeVisible();
    // Проверяем, что есть хотя бы одно поле для изменения порога
    const inputCount = await page.locator("#actionsFormField input[data-id='action']").count();
    expect(inputCount).toBeGreaterThan(0);
    // Находим первое поле для изменения порога
    const input = page.locator("#actionsFormField input[data-id='action']").first();
    const oldValue = await input.inputValue();
    await input.fill("7");
    // Сохраняем изменения
    await page.click("#saveActionsBtn");
    // Проверяем, что alert-error не появился в течение 2 секунд после сохранения
    const alert = page.locator(".alert-error, .alert-modal.alert-error");
    try {
        await expect(alert).not.toBeVisible({timeout: 2000});
    } catch (e) {
        const alertText = await alert.textContent();
        console.log("[E2E] Alert error text:", alertText);
        throw e;
    }
    // Возвращаем старое значение (чистим за собой)
    await input.fill(oldValue);
    await page.click("#saveActionsBtn");
});
