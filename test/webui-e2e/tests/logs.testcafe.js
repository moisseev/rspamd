(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("Logs page test")
        .page("http://rspamd-container:11334");

    test("Logs page displays recent errors and allows refresh", async (t) => {
        const historyNav = Selector("#history_nav");
        const errorsLog = Selector("#errorsLog");
        const tableRows = Selector("#errorsLog tbody tr");
        const updateErrors = Selector("#updateErrors");

        await t.click(historyNav);

        // Check errors table presence
        await t.expect(errorsLog.visible).ok();

        // Step 1: Check initial state (should be empty or few errors)
        const initialRowCount = await tableRows.count;

        // Step 2: Trigger a critical error by making HTTP request to non-existent endpoint
        try {
            await t.request("http://rspamd-container:11334/nonexistent");
        } catch (error) {
            // Expected to fail, this will trigger a critical error in rspamd logs
        }

        // Step 3: Use Update button to refresh the table
        await t.click(updateErrors);

        // Step 4: Wait for table to update and check that new error appeared
        await t.wait(2000); // Wait for table to update
        const newRowCount = await tableRows.count;
        await t.expect(newRowCount).gt(initialRowCount, "New error should appear in the log");

        // Step 5: Check content of the new error (should contain information about the failed request)
        if (newRowCount > initialRowCount) {
            // Get the first row (most recent error)
            const firstRow = tableRows.nth(0);
            const errorText = await firstRow.textContent;

            // Check that the error contains relevant information
            await t.expect(errorText).contains("controller", "Error should be from controller module");
        }

        // Step 6: Verify table is still visible after update
        await t.expect(errorsLog.visible).ok();
    });
}());
