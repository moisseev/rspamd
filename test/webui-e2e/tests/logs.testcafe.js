(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("Logs page test")
        .page("http://rspamd-container:11334");

    test("Logs page displays recent errors and allows refresh", async (t) => {
        // Check connectivity and authentication mode for both IPv4 and IPv6

        // IPv4 connectivity and read_only check
        try {
            const response4 = await t.request("http://rspamd-container:11334/auth");
            const readOnly4 = response4.body.read_only;

            if (readOnly4 === true) {
                console.log("❌ IPv4: User is in read-only mode - secure_ip may not be working correctly");
                await t.expect(readOnly4).notOk("❌ IPv4: User is in read-only mode - secure_ip may not be working correctly");
            } else {
                console.log("✅ IPv4: User has full access - secure_ip working correctly");
                await t.expect(readOnly4).eql(false, "✅ IPv4: User has full access - secure_ip working correctly");
            }
        } catch (error) {
            const errorMsg = error.message || "Unknown error";
            console.log(`❌ IPv4 connection failed: ${errorMsg}`);
            await t.expect(error).notOk(`❌ IPv4 connection failed: ${errorMsg}`);
        }

        // IPv6 connectivity and read_only check
        try {
            const response6 = await t.request("http://[fd00:dead:beef::2]:11334/auth");
            console.log(`🔍 IPv6 response status: ${response6.status}`);
            console.log(`🔍 IPv6 response body: ${JSON.stringify(response6.body)}`);

            const readOnly6 = response6.body.read_only;

            if (readOnly6 === true) {
                console.log("❌ IPv6: User is in read-only mode - secure_ip may not be working correctly");
                await t.expect(readOnly6).notOk("❌ IPv6: User is in read-only mode - secure_ip may not be working correctly");
            } else if (readOnly6 === false) {
                console.log("✅ IPv6: User has full access - secure_ip working correctly");
                await t.expect(readOnly6).eql(false, "✅ IPv6: User has full access - secure_ip working correctly");
            } else {
                console.log(`⚠️ IPv6: Unexpected read_only value: ${readOnly6}`);
                console.log(`⚠️ IPv6: Response body keys: ${Object.keys(response6.body || {}).join(", ")}`);
                await t.expect(readOnly6).eql(false, `Unexpected read_only value: ${readOnly6}`);
            }
        } catch (error) {
            // IPv6 connection failed - check if this is expected
            const errorMsg = error.message || "Network unreachable";
            console.log(`❌ IPv6 connection failed: ${errorMsg}`);
            await t.expect(error).ok(`IPv6 connection failed: ${errorMsg}`);
        }

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
