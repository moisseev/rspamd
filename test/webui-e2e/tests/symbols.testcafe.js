(function () {
    "use strict";
    const {Selector, RequestLogger} = require("testcafe");

    // Create a request logger to track symbols API requests
    const symbolsLogger = RequestLogger(/\/symbols/, {
        logRequestHeaders: true,
        logResponseHeaders: true,
        logResponseBody: true,
        stringifyResponseBody: true
    });

    fixture("Symbols page test")
        .page("http://rspamd-container:11334")
        .requestHooks(symbolsLogger);

    test("Symbols page shows list of symbols and allows editing", async (t) => {
        const symbolsNav = Selector("#symbols_nav");
        const symbolsTable = Selector("#symbolsTable");
        // Include *any* <tr> inside the table, except those in the THEAD or TFOOT.
        let tableRows = Selector("#symbolsTable tr:not(thead tr):not(tfoot tr)").filterVisible();

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

        // Use direct API call to get properly formatted response
        console.log("Making direct API call to get symbols data...");
        try {
            const symbolsResponse = await t.request("http://rspamd-container:11334/symbols");
            console.log(`Direct API response status: ${symbolsResponse.status}`);
            console.log(`Direct API response body type: ${typeof symbolsResponse.body}`);

            if (symbolsResponse.body && symbolsResponse.body.symbols) {
                console.log(`Direct API symbols count: ${symbolsResponse.body.symbols.length}`);
                if (symbolsResponse.body.symbols.length > 0) {
                    console.log(`Direct API first symbol: ${JSON.stringify(symbolsResponse.body.symbols[0])}`);
                }
            } else {
                console.log("Direct API response body structure:", Object.keys(symbolsResponse.body || {}));
                // Log first few items to understand the structure
                if (symbolsResponse.body && Array.isArray(symbolsResponse.body)) {
                    console.log(`Direct API array length: ${symbolsResponse.body.length}`);
                    if (symbolsResponse.body.length > 0) {
                        console.log(`Direct API first item: ${JSON.stringify(symbolsResponse.body[0])}`);
                    }
                }
            }
        } catch (e) {
            console.log(`Direct API call failed: ${e.message}`);
        }

        // Also log RequestLogger data for comparison
        const symbolsRequests = symbolsLogger.requests.filter((r) => r.request.url.includes("/symbols"));
        console.log(`Found ${symbolsRequests.length} symbols API requests via RequestLogger`);
        if (symbolsRequests.length > 0) {
            const lastRequest = symbolsRequests[symbolsRequests.length - 1];
            console.log(`RequestLogger - Status: ${lastRequest.response.statusCode}`);

            const contentEncoding = lastRequest.response.headers["content-encoding"];
            const contentType = lastRequest.response.headers["content-type"];
            console.log(`RequestLogger - Headers: Content-Encoding: ${contentEncoding}, Content-Type: ${contentType}`);
        }

        // Wait for table to be populated with data from API
        console.log("Waiting for table to be populated with data...");

        // Wait for FooTable to be ready (based on WebUI code)
        console.log("Waiting for FooTable to be ready...");
        await t.expect(symbolsTable.exists).ok("Symbols table should exist", {timeout: 5000});

        // Wait for FooTable to be ready and have content
        console.log("Waiting for FooTable to be ready...");

        // Wait for the table to have the footable class (indicates FooTable is initialized)
        await t.expect(symbolsTable.hasClass("footable")).ok("Table should have footable class", {timeout: 10000});

        // Debug: Check FooTable state and structure
        console.log("Debugging FooTable state...");
        const tableClasses = await symbolsTable.classNames;
        console.log(`Table classes: ${tableClasses}`);

        // Debug: Check table structure
        console.log("Checking table structure...");
        const tableStructureHTML = await symbolsTable.innerHTML;
        console.log(`Table HTML structure: ${tableStructureHTML ? tableStructureHTML.substring(0, 1000) : "null"}`);

        // Check if tbody exists in original HTML
        const tbodyExists = await symbolsTable.find("tbody").exists;
        console.log(`tbody exists in HTML: ${tbodyExists}`);

        // Check all direct children of table
        const tableChildren = await symbolsTable.childElementCount;
        console.log(`Table has ${tableChildren} direct children`);

        // List all direct children
        for (let i = 0; i < tableChildren; i++) {
            const child = symbolsTable.child(i);
            const childTagName = await child.tagName;
            console.log(`Child ${i}: ${childTagName}`);
        }

        // Wait for FooTable to be fully ready using the ready.ft.table event
        console.log("Waiting for FooTable ready.ft.table event...");

        // Use client function to wait for FooTable ready event and tbody creation
        await t.eval(() => new Promise((resolve) => {
            const table = document.getElementById("symbolsTable");
            if (table) {
                // Check if FooTable is already ready with tbody and data
                if (table.classList.contains("footable") && table.querySelector("tbody tr")) {
                    console.log("FooTable already ready with tbody and data");
                    resolve(true);
                    return;
                }

                // Listen for the ready.ft.table event
                // eslint-disable-next-line no-undef
                $(table).one("ready.ft.table", () => {
                    console.log("FooTable ready.ft.table event fired");
                    // Wait a bit more for tbody to be populated
                    setTimeout(() => {
                        if (table.querySelector("tbody tr")) {
                            console.log("FooTable tbody populated after ready event");
                            resolve(true);
                        } else {
                            console.log("FooTable ready but no tbody data yet");
                            resolve(false);
                        }
                    }, 2000);
                });

                // Fallback timeout - check for tbody creation
                setTimeout(() => {
                    console.log("FooTable ready timeout - checking if table has tbody with data");
                    if (table.querySelector("tbody tr")) {
                        console.log("FooTable tbody found with data after timeout");
                        resolve(true);
                    } else {
                        console.log("FooTable timeout - no tbody with data found");
                        resolve(false);
                    }
                }, 15000);
            } else {
                resolve(false);
            }
        }), {timeout: 20000});

        console.log("FooTable should be ready now");

        // Debug: Check what FooTable actually created after ready event
        console.log("Debugging FooTable after ready event...");
        await t.expect(tableRows.count).gt(0, "Symbols table should have at least one data row");

        // Check all tr elements in the table
        const allTrCount = await symbolsTable.find("tr").count;
        console.log(`Total tr elements after ready: ${allTrCount}`);

        // Wait for tbody to exist and have content
        console.log("Waiting for tbody to exist and have content...");

        // Wait for actual content in the first row
        const firstRowContent = tableRows.nth(0).textContent;
        await t.expect(firstRowContent).notEql("", "First table row should have content");

        // Now check the actual row count
        const rowCount = await tableRows.count;
        console.log(`Symbols table has ${rowCount} rows after API request`);

        // Wait for table to have meaningful content (not just empty rows)
        console.log("Waiting for table to have meaningful content...");
        await t.expect(tableRows.nth(0).textContent).notEql("", "First table row should have content", {timeout: 5000});

        // Debug table structure
        const tableHTML = await symbolsTable.innerHTML;
        console.log(`Table HTML (first 500 chars): ${tableHTML ? tableHTML.substring(0, 500) : "null"}...`);

        // Check if table has loading state or error state
        const loadingElement = Selector("#symbolsTable .loading, #symbolsTable .spinner");
        const errorElement = Selector("#symbolsTable .error, #symbolsTable .alert-error");

        const hasLoading = await loadingElement.exists;
        const hasError = await errorElement.exists;
        console.log(`Table has loading state: ${hasLoading}, has error state: ${hasError}`);

        // Try alternative selectors if main selector doesn't work
        if (rowCount === 0) {
            console.log("Trying alternative table selectors...");
            const altTableRows = Selector("#symbolsTable tr, .symbols-table tr, table tr");
            const altRowCount = await altTableRows.count;
            console.log(`Alternative selector found ${altRowCount} rows`);

            if (altRowCount > 0) {
                console.log("Using alternative selector for table rows");
                // Update the selector for the rest of the test
                tableRows = altTableRows;
            }
        }

        // Wait for symbols data to load (table should have at least one row)
        await t.expect(tableRows.count).gt(0, "Symbols table should have at least one row");

        // Take screenshot for debugging
        await t.takeScreenshot("symbols-page-loaded.png");

        // Try to change score value for first symbol
        const scoreInput = Selector("#symbolsTable .scorebar").nth(0);
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
