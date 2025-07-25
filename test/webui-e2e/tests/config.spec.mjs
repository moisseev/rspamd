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

test("Config page: always checks order error and valid save for actions", async ({page}) => {
    await page.goto("http://localhost:11334");
    await page.click("#configuration_nav");
    await expect(page.locator("#actionsFormField")).toBeVisible();
    const inputs = page.locator("#actionsFormField input[data-id='action']");
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
    // Сохраняем исходные значения
    const values = await Promise.all(Array.from({length: count}, (_, i) => inputs.nth(i).inputValue()));
    // Определяем только реально доступные для ввода поля (не disabled, не readonly)
    const fillableIndices = [];
    const fillableChecks = Array.from({length: count}, (_, i) => (async () => {
        const input = inputs.nth(i);
        const isDisabled = await input.isDisabled();
        const isReadOnly = await input.evaluate((el) => el.hasAttribute("readonly"));
        if (!isDisabled && !isReadOnly) {
            fillableIndices.push(i);
        }
    })());
    await Promise.all(fillableChecks);
    // 1. Корректный порядок: строго убывающая последовательность
    const correctOrder = fillableIndices.map((_, idx) => ((fillableIndices.length - idx) * 10).toString());
    await Promise.all(fillableIndices.map((i, idx) => inputs.nth(i).fill(correctOrder[idx])));
    await page.click("#saveActionsBtn");
    const alert = page.locator(".alert-error, .alert-modal.alert-error");
    await logAlertOnError(page, alert, async () => {
        await expect(alert).not.toBeVisible({timeout: 2000});
    });
    // Перезагружаем страницу и убеждаемся, что новое значение сохранилось
    await page.reload();
    await page.click("#configuration_nav");
    await expect(page.locator("#actionsFormField")).toBeVisible();
    const newInputs = page.locator("#actionsFormField input[data-id='action']");
    const saved = await Promise.all(fillableIndices.map((i) => newInputs.nth(i).inputValue()));
    expect(saved).toEqual(correctOrder);
    // 2. Нарушаем порядок: возрастающая последовательность
    const wrongOrder = fillableIndices.map((_, idx) => (idx * 10).toString());
    await Promise.all(fillableIndices.map((i, idx) => newInputs.nth(i).fill(wrongOrder[idx])));
    await page.click("#saveActionsBtn");
    await expect(alert).toBeVisible({timeout: 2000});
    const alertText = await alert.textContent();
    expect(alertText).toContain("Incorrect order of actions thresholds");
    // Возвращаем исходные значения
    await Promise.all(fillableIndices.map((i) => newInputs.nth(i).fill(values[i])));
    await page.click("#saveActionsBtn");
});
