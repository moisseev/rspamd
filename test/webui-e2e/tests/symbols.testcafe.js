(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("Symbols page test")
        .page("http://localhost:11334");

    test("Symbols page shows list of symbols and allows editing", async (t) => {
        const symbolsNav = Selector("#symbols_nav");
        const symbolsTable = Selector("#symbolsTable");
        const tableRows = Selector("#symbolsTable tbody tr");
        const groupSelect = Selector(".form-select");
        const scoreInput = Selector("#symbolsTable .scorebar").nth(0);
        const saveAlert = Selector("#save-alert");
        const saveButton = Selector("#save-alert button");
        const successAlert = Selector(".alert-success, .alert-modal.alert-success");

        await t.click(symbolsNav);
        await t.expect(symbolsTable.visible).ok();

        // Check that there is at least one row (excluding header)
        const rowCount = await tableRows.count;
        await t.expect(rowCount).gt(0);

        // Check group filtering if selector exists
        const selectCount = await groupSelect.count;
        if (selectCount > 0) {
            await t.click(groupSelect.nth(0));
            await t.click(groupSelect.nth(0).find("option").nth(1));
            const filteredCount = await tableRows.count;
            await t.expect(filteredCount).gt(0);
        }

        // Try to change score value for first symbol
        const oldValue = await scoreInput.value;
        await t.typeText(scoreInput, "0.01", {replace: true});
        await t.pressKey("tab");

        // Should show save notification
        await t.expect(saveAlert.visible).ok();

        // Save changes
        await t.click(saveButton);

        // Check for success notification
        await t.expect(successAlert.visible).ok({timeout: 10000});

        // Restore old value
        await t.typeText(scoreInput, oldValue, {replace: true});
        await t.pressKey("tab");
        await t.click(saveButton);
    });
}());
