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

// Вспомогательная функция для последовательного заполнения полей
function fillSequentially(elements, values) {
    return elements.reduce((promise, el, i) => promise.then(() => el.fill(values[i])), Promise.resolve());
}

test("Config page: always checks order error and valid save for actions", async ({page}, testInfo) => {
    const {enablePassword} = testInfo.project.use.rspamdPasswords;

    await page.goto("/");

    const passwordInput = page.locator("#connectPassword");
    await passwordInput.fill(enablePassword);
    await page.click("#connectButton");

    await page.click("#configuration_nav");

    await expect(page.locator("#actionsFormField")).toBeVisible({timeout: 10000});

    function getInputs() { return page.locator("#actionsFormField input[data-id='action']"); }
    const alert = page.locator(".alert-error, .alert-modal.alert-error");

    const inputs = getInputs();
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
    await Promise.all(
        Array.from({length: count}, (_, i) => expect(inputs.nth(i)).toBeVisible())
    );

    // Сохраняем исходные значения
    const values = await Promise.all(Array.from({length: count}, (_, i) => inputs.nth(i).inputValue()));

    // Определяем только реально доступные для ввода поля (не disabled, не readonly)
    const fillableChecks = Array.from({length: count}, (_, i) => (async () => {
        const input = inputs.nth(i);
        const isDisabled = await input.isDisabled();
        const isReadOnly = await input.evaluate((el) => el.hasAttribute("readonly"));
        return !isDisabled && !isReadOnly ? i : null;
    })());
    const fillableIndices = (await Promise.all(fillableChecks)).filter((i) => i !== null);

    const fillableInputs = fillableIndices.map((i) => inputs.nth(i));

    // 1. Корректный порядок: строго убывающая последовательность
    const correctOrder = fillableIndices.map((_, idx) => (idx * 10).toString());

    await fillSequentially(fillableInputs, correctOrder);

    await page.click("#saveActionsBtn");

    await logAlertOnError(page, alert, async () => {
        await expect(alert).not.toBeVisible({timeout: 2000});
    });

    // Перезагружаем конфигурацию и убеждаемся, что новое значение сохранилось
    await page.click("#refresh");
    await page.click("#configuration_nav");

    const reloadedInputs = getInputs();
    const reloadedCount = await reloadedInputs.count();

    // Пересчитываем доступные для заполнения поля после перезагрузки
    const reloadedFillableChecks = Array.from({length: reloadedCount}, (_, i) => (async () => {
        const input = reloadedInputs.nth(i);
        const isDisabled = await input.isDisabled();
        const isReadOnly = await input.evaluate((el) => el.hasAttribute("readonly"));
        return !isDisabled && !isReadOnly ? i : null;
    })());
    const reloadedFillableIndices = (await Promise.all(reloadedFillableChecks)).filter((i) => i !== null);
    const reloadedFillableInputs = reloadedFillableIndices.map((i) => reloadedInputs.nth(i));

    await Promise.all(reloadedFillableInputs.map((input) => expect(input).toBeVisible()));

    const saved = await Promise.all(reloadedFillableInputs.map((input) => input.inputValue()));
    expect(saved).toEqual(correctOrder);

    // 2. Нарушаем порядок: возрастающая последовательность
    const wrongOrder = reloadedFillableIndices.map((_, idx) => ((reloadedFillableIndices.length - idx) * 10).toString());

    await fillSequentially(reloadedFillableInputs, wrongOrder);

    await page.click("#saveActionsBtn");

    await expect(alert).toBeVisible({timeout: 10000});
    const alertText = await alert.textContent();
    expect(alertText).toContain("Incorrect order of actions thresholds");

    // Возвращаем исходные значения
    await fillSequentially(reloadedFillableInputs, values);

    await page.click("#saveActionsBtn");
});
