import {expect, test} from "@playwright/test";

async function logAlertOnError(page, locator, fn) {
    try {
        await fn();
    } catch (e) {
        const alertText = await locator.textContent();
        // eslint-disable-next-line no-console
        console.log("[E2E] Alert error text:", alertText);
        throw e;
    }
}

test("Config page: shows error on invalid action order and allows valid change", async ({page}) => {
    await page.goto("http://localhost:11334");
    await page.click("#configuration_nav");
    await expect(page.locator("#actionsFormField")).toBeVisible();
    const inputs = page.locator("#actionsFormField input[data-id='action']");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(1);
    // Сохраняем исходные значения
    const values = await Promise.all(Array.from({length: count}, (_, i) => inputs.nth(i).inputValue()));
    // 1. Нарушаем порядок: делаем значение первого поля больше второго
    await inputs.nth(0).fill((parseFloat(values[1]) + 1).toString());
    await page.click("#saveActionsBtn");
    // Проверяем, что появляется alert с нужным текстом
    const alert = page.locator(".alert-error, .alert-modal.alert-error");
    await expect(alert).toBeVisible({timeout: 2000});
    const alertText = await alert.textContent();
    expect(alertText).toContain("Incorrect order of actions thresholds");
    // 2. Корректно меняем последнее поле (делаем его чуть меньше предыдущего)
    await inputs.nth(0).fill(values[0]); // возвращаем исходное
    const prev = parseFloat(values[count - 2]);
    const newValue = (prev - 1).toString();
    await inputs.nth(count - 1).fill(newValue);
    await page.click("#saveActionsBtn");
    // Проверяем, что alert-error не появляется
    await logAlertOnError(page, alert, async () => {
        await expect(alert).not.toBeVisible({timeout: 2000});
    });
    // Перезагружаем страницу и убеждаемся, что новое значение сохранилось
    await page.reload();
    await page.click("#configuration_nav");
    await expect(page.locator("#actionsFormField")).toBeVisible();
    const newInputs = page.locator("#actionsFormField input[data-id='action']");
    const saved = await newInputs.nth(count - 1).inputValue();
    expect(saved).toBe(newValue);
    // Возвращаем исходные значения
    await Promise.all(Array.from({length: count}, (_, i) => newInputs.nth(i).fill(values[i])));
    await page.click("#saveActionsBtn");
});
