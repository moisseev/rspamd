import {expect, test} from "@playwright/test";

test("Symbols page shows list of symbols and allows editing", async ({page}, testInfo) => {
    const {enablePassword} = testInfo.project.use.rspamdPasswords;

    await page.goto("/");

    const passwordInput = page.locator("#connectPassword");
    await passwordInput.fill(enablePassword);
    await page.click("#connectButton");

    await page.click("#symbols_nav");
    await expect(page.locator("#symbolsTable")).toBeVisible();
    // Проверяем, что есть хотя бы одна строка (кроме заголовка)
    const rowCount = await page.locator("#symbolsTable tbody tr").count();
    expect(rowCount).toBeGreaterThan(0);
    // Проверяем фильтрацию по группе (если есть селектор)
    const groupSelect = page.locator(".form-select");
    if (await groupSelect.count()) {
        await groupSelect.first().selectOption({index: 1});
        const filteredCount = await page.locator("#symbolsTable tbody tr").count();
        expect(filteredCount).toBeGreaterThan(0);
    }
    // Пробуем изменить значение score для первого символа
    let scoreInput = page.locator("#symbolsTable .scorebar").first();
    const scoreInputId = await scoreInput.evaluate((element) => element.id);
    const oldValue = await scoreInput.inputValue();
    await scoreInput.fill((parseFloat(oldValue) + 0.01).toFixed(2));
    await scoreInput.blur();
    // Должно появиться уведомление о необходимости сохранения
    await expect(page.locator("#save-alert")).toBeVisible();
    // Сохраняем изменения
    await page.click("#save-alert button");
    // Проверяем, что появилось уведомление об успешном сохранении (ждем любой alert-success)
    await expect(page.locator(".alert-success, .alert-modal.alert-success")).toBeVisible();
    // Возвращаем старое значение (чистим за собой)
    await expect(page.locator(".alert-success, .alert-modal.alert-success")).not.toBeVisible({timeout: 10000});
    scoreInput = page.locator("#" + scoreInputId);
    await scoreInput.fill(oldValue);
    await scoreInput.blur();
    await page.click("#save-alert button");
});
