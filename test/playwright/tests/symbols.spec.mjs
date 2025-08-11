import {expect, test} from "@playwright/test";
import {login} from "../helpers/auth.mjs";

test.describe("Symbols", () => {
    test.beforeEach(async ({page}, testInfo) => {
        const {enablePassword} = testInfo.project.use.rspamdPasswords;
        await login(page, enablePassword);
        await page.locator("#symbols_nav").click();
        await expect(page.locator("#symbolsTable")).toBeVisible();
        // Ensure table data has been loaded before running tests
        await expect(page.locator("#symbolsTable tbody tr").first()).toBeVisible();
    });

    test("shows list and allows filtering by group", async ({page}) => {
        // Check filtering by group (if selector exists)
        const groupSelect = page.locator(".footable-filtering select.form-select").first();
        if (await groupSelect.count()) {
            // Ensure there is at least one real group besides "Any group"
            const optionCount = await groupSelect.evaluate((el) => el.options.length);
            expect(optionCount).toBeGreaterThan(1);

            // Read target group's value and text BEFORE selection to avoid FooTable redraw races
            const target = await groupSelect.evaluate((el) => {
                const [, op] = Array.from(el.options); // first non-default option
                return {text: op.text, value: op.value};
            });

            // Read current texts before filtering
            const beforeTexts = await page.locator("#symbolsTable tbody tr td.footable-first-visible").allTextContents();

            await groupSelect.selectOption({value: target.value});
            const selectedGroup = target.text;

            // Ensure table rows are loaded after filtering by waiting for table content to change
            const groupCells = page.locator("#symbolsTable tbody tr td.footable-first-visible");
            await expect.poll(async () => {
                const afterTexts = await groupCells.allTextContents();
                return afterTexts;
            }).not.toEqual(beforeTexts);

            // Validate that all visible rows belong to the selected group
            const texts = await groupCells.allTextContents();
            for (const text of texts) {
                expect(text.toLowerCase()).toContain(selectedGroup.toLowerCase());
            }
        }
    });

    test.describe.configure({mode: "serial"});
    test("edits score for the first symbol and saves", async ({page}) => {
        // Try to change the score value for the first symbol
        let scoreInput = page.locator("#symbolsTable .scorebar").first();
        const scoreInputId = await scoreInput.evaluate((element) => element.id);
        const oldValue = await scoreInput.inputValue();
        await scoreInput.fill((parseFloat(oldValue) + 0.01).toFixed(2));
        await scoreInput.blur();
        // A save notification should appear
        await expect(page.locator("#save-alert")).toBeVisible();
        // Save changes
        await page.locator("#save-alert").getByRole("button", {exact: true, name: "Save"}).click();
        // A success alert should appear (wait for any alert-success)
        await expect(page.locator(".alert-success, .alert-modal.alert-success")).toBeVisible();
        // Revert to the old value (clean up after the test)
        await expect(page.locator(".alert-success, .alert-modal.alert-success")).not.toBeVisible({timeout: 10000});
        scoreInput = page.locator("#" + scoreInputId);
        await scoreInput.fill(oldValue);
        await scoreInput.blur();
        await page.locator("#save-alert").getByRole("button", {exact: true, name: "Save"}).click();
    });
});
