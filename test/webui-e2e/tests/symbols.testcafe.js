(function () {
    "use strict";
    const {Selector, RequestLogger} = require("testcafe");

    // Create a request logger to track symbols API requests
    const symbolsLogger = RequestLogger(/\/symbols/, {
        logRequestHeaders: true,
        logResponseHeaders: true,
        logResponseBody: false
    });

    fixture("Symbols page test")
        .page("http://rspamd-container:11334")
        .requestHooks(symbolsLogger);

    test("Symbols page shows list of symbols and allows editing", async (t) => {
        const symbolsNav = Selector("#symbols_nav");
        const symbolsTable = Selector("#symbolsTable");
        const tableRows = Selector("#symbolsTable tbody tr");
        const groupSelect = Selector(".form-select");
        const scoreInput = Selector("#symbolsTable .scorebar").nth(0);
        const saveAlert = Selector("#save-alert");
        const saveButton = Selector("#save-alert button");
        const successAlert = Selector(".alert-success, .alert-modal.alert-success");

        // Wait for the Symbols tab to be enabled (not disabled)
        await t.expect(symbolsNav.hasAttribute("disabled")).notOk("Symbols tab should be enabled");
        await t.expect(symbolsNav.visible).ok("Symbols tab should be visible");

        // Debug: log current state
        const isDisabled = await symbolsNav.hasAttribute("disabled");
        const isVisible = await symbolsNav.visible;
        console.log(`Symbols tab - disabled: ${isDisabled}, visible: ${isVisible}`);

        await t.click(symbolsNav);
        await t.expect(symbolsTable.visible).ok();

        // Wait for symbols API request to complete
        console.log("Waiting for symbols API request to complete...");
        const symbolsRequestCompleted = symbolsLogger.contains((r) =>
            r.request.url.includes("/symbols") && r.response.statusCode === 200
        );
        await t.expect(symbolsRequestCompleted).ok("Symbols API request should complete successfully", {timeout: 10000});

        // Log the request details for debugging
        const symbolsRequests = symbolsLogger.requests.filter((r) => r.request.url.includes("/symbols"));
        console.log(`Found ${symbolsRequests.length} symbols API requests`);
        if (symbolsRequests.length > 0) {
            const lastRequest = symbolsRequests[symbolsRequests.length - 1];
            const requestInfo = `${lastRequest.request.method} ${lastRequest.request.url} - ` +
                `Status: ${lastRequest.response.statusCode}`;
            console.log(`Last symbols request: ${requestInfo}`);
        }

        // Wait a bit more for the table to be populated with data
        await t.wait(2000);

        // Now check if table has data
        const rowCount = await tableRows.count;
        console.log(`Symbols table has ${rowCount} rows after API request`);

        // Wait for symbols data to load (table should have at least one row)
        await t.expect(tableRows.count).gt(0, "Symbols table should have at least one row");

        // Take screenshot for debugging
        await t.takeScreenshot("symbols-page-loaded.png");

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
        await t.expect(successAlert.visible).ok();

        // Restore old value
        await t.typeText(scoreInput, oldValue, {replace: true});
        await t.pressKey("tab");
        await t.click(saveButton);
    });
}());
