/* global jQuery */

const {Selector, ClientFunction} = require("testcafe");

fixture("Symbols page").page("http://rspamd-container:11334");

test("Symbols page shows list and allows editing", async (t) => {
    "use strict";

    const nav = Selector("#symbols_nav");
    const table = Selector("#symbolsTable");
    const saveBtn = Selector("#save-alert button");
    const success = Selector(".alert-success, .alert-modal.alert-success");
    const waitForFooTable = ClientFunction(() => new Promise((resolve) => {
        const start = Date.now();

        (function check() {
            const tbl = document.getElementById("symbolsTable");
            if (!window.jQuery || !tbl) {
                resolve();
                return;
            }
            const ftData = jQuery(tbl).data("__FooTable__");
            if (ftData && ftData.initialized) {
                resolve();
                return;
            }
            if (Date.now() - start > 5000) {
                resolve();
                return;
            }
            setTimeout(check, 100);
        }());
    }));

    await t
        .expect(nav.hasAttribute("disabled")).notOk("Symbols tab should be enabled")
        .click(nav)
        .expect(table.visible).ok("Symbols table must be visible");

    await waitForFooTable();

    const rows = table.find("tr").filterVisible();

    await t.expect(rows.count).gt(0, "FooTable should have at least one visible row");

    const firstRow = rows.nth(0);
    const firstCell = firstRow.find("td").nth(0);

    await t.expect(firstCell.textContent).notEql("", "First cell must contain text");

    const scoreInput = table.find(".scorebar").nth(0);
    const oldValue = await scoreInput.value;

    await t
        .selectText(scoreInput).pressKey("delete")
        .typeText(scoreInput, "0.01")
        .click(saveBtn)
        .expect(success.visible)
        .ok("Save should show success alert");

    await t
        .selectText(scoreInput).pressKey("delete")
        .typeText(scoreInput, oldValue)
        .click(saveBtn)
        .expect(success.visible)
        .ok("Restore should also succeed");
});
