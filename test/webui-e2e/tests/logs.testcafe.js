(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("Logs page test")
        .page("http://localhost:11334");

    test("Logs page displays recent errors and allows refresh", async (t) => {
        const historyNav = Selector("#history_nav");
        const errorsLog = Selector("#errorsLog");
        const tableRows = Selector("#errorsLog tbody tr");
        const updateErrors = Selector("#updateErrors");

        await t.click(historyNav);

        // Check errors table presence
        await t.expect(errorsLog.visible).ok();

        // Check that there is at least one row (excluding header)
        const rowCount = await tableRows.count;
        await t.expect(rowCount).gt(0);

        // Check refresh button
        await t.click(updateErrors);

        // After refresh table should be visible
        await t.expect(errorsLog.visible).ok();
    });
}());
