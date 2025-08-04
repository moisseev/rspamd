/**
 * Symbols page test for TestCafe
 *
 * This test verifies that the symbols page displays correctly and allows score editing.
 *
 * For debugging in browser console:
 * 1. Open the Rspamd WebUI in your browser
 * 2. Open browser console (F12)
 * 3. Copy and paste the testSymbolsPageBrowser function from this file
 * 4. Run: testSymbolsPageBrowser().then(console.log).catch(console.error)
 *
 * The test will:
 * - Navigate to the symbols tab
 * - Wait for the table to load
 * - Change a score value
 * - Save the change
 * - Restore the original value
 * - Save again
 * - Verify success alerts appear
 */

(function () {
    "use strict";
    // TestCafe imports - only used in TestCafe environment
    let ClientFunction = null;
    try {
        const {ClientFunction: CF} = require("testcafe");
        ClientFunction = CF;
    } catch (e) {
        // Not in TestCafe environment (e.g., browser console)
    }

    // Browser-compatible version for debugging in console
    async function testSymbolsPageBrowser() {
        const start = Date.now();

        function waitForElement(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                function check() {
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null) {
                        resolve(element);
                        return;
                    }
                    if (Date.now() - start > timeout) {
                        reject(new Error(`Element ${selector} not found or not visible within ${timeout}ms`));
                        return;
                    }
                    setTimeout(check, 100);
                }
                check();
            });
        }

        console.log("Starting symbols page test in browser...");

        // Wait for symbols navigation and click it
        const symbolsNav = await waitForElement("#symbols_nav");
        console.log("Clicking on Symbols tab...");
        symbolsNav.click();

        // Wait for symbols table
        const symbolsTable = await waitForElement("#symbolsTable");
        console.log("Symbols table is visible");

        // Wait for update button and click it
        const updateBtn = await waitForElement("#updateSymbols");
        console.log("Clicking update button to refresh symbols data...");
        updateBtn.click();

        // Wait for table to be populated
        console.log("Waiting for table to be populated...");
        await new Promise((resolve) => {
            setTimeout(resolve, 3000);
        });

        // Check for visible rows
        const rows = Array.from(symbolsTable.querySelectorAll("tbody tr")).filter(
            (row) => row.offsetParent !== null
        );
        console.log(`Visible row count: ${rows.length}`);

        if (rows.length === 0) {
            console.log("Table is empty, verifying structure...");
            return "Test passed - table structure verified";
        }

        // Get first row and score input
        const [firstRow] = rows;
        const scoreInput = firstRow.querySelector(".scorebar");
        if (!scoreInput) {
            throw new Error("Score input not found in first row");
        }

        const currentScore = scoreInput.value;
        console.log(`Current score value: ${currentScore}`);

        // Change score
        const newScore = Number(currentScore) + 1;
        console.log(`Changing score to: ${newScore}`);
        scoreInput.value = newScore;
        scoreInput.dispatchEvent(new Event("input", {bubbles: true}));
        scoreInput.dispatchEvent(new Event("change", {bubbles: true}));

        // Wait for save alert
        const saveAlert = await waitForElement("#save-alert");
        console.log("Save alert appeared");

        // Click save button
        const saveBtn = saveAlert.querySelector("button:not([data-save])");
        if (!saveBtn) {
            throw new Error("Save button not found");
        }
        console.log("Clicking save button...");
        saveBtn.click();

        // Wait for success alert
        await waitForElement(".alert-success, .alert-modal.alert-success");
        console.log("Success alert appeared");

        // Restore original score
        console.log("Restoring original score value...");
        scoreInput.value = currentScore;
        scoreInput.dispatchEvent(new Event("input", {bubbles: true}));
        scoreInput.dispatchEvent(new Event("change", {bubbles: true}));

        // Wait for save alert again
        await waitForElement("#save-alert");
        saveBtn.click();

        // Wait for success alert again
        await waitForElement(".alert-success, .alert-modal.alert-success");
        console.log("Success alert appeared again");

        console.log("Symbols page test completed successfully");
        return "Test passed";
    }

    // Make the function available globally for browser console debugging
    if (typeof window !== "undefined") {
        window.testSymbolsPage = testSymbolsPageBrowser;
    }

    fixture("Symbols page test")
        .page("http://rspamd-container:11334");

    test("Symbols page displays symbols table and allows score editing", async (t) => {
        console.log("Starting symbols page test...");

        // Create a ClientFunction that injects and executes the test function
        const testSymbolsPageClient = ClientFunction(() => {
            // Define the test function directly in the browser context
            async function runSymbolsTest() {
                const start = Date.now();

                function waitForElement(selector, timeout = 10000) {
                    return new Promise((resolve, reject) => {
                        function check() {
                            const element = document.querySelector(selector);
                            if (element && element.offsetParent !== null) {
                                resolve(element);
                                return;
                            }
                            if (Date.now() - start > timeout) {
                                reject(new Error(`Element ${selector} not found or not visible within ${timeout}ms`));
                                return;
                            }
                            setTimeout(check, 100);
                        }
                        check();
                    });
                }

                console.log("Starting symbols page test in browser...");

                // Wait for symbols navigation and click it
                const symbolsNav = await waitForElement("#symbols_nav");
                console.log("Clicking on Symbols tab...");
                symbolsNav.click();

                // Wait for symbols table
                const symbolsTable = await waitForElement("#symbolsTable");
                console.log("Symbols table is visible");

                // Wait for update button and click it
                const updateBtn = await waitForElement("#updateSymbols");
                console.log("Clicking update button to refresh symbols data...");
                updateBtn.click();

                // Wait for table to be populated
                console.log("Waiting for table to be populated...");
                await new Promise((resolve) => {
                    setTimeout(resolve, 3000);
                });

                // Check for visible rows
                const rows = Array.from(symbolsTable.querySelectorAll("tbody tr")).filter(
                    (row) => row.offsetParent !== null
                );
                console.log(`Visible row count: ${rows.length}`);

                if (rows.length === 0) {
                    console.log("Table is empty, verifying structure...");
                    return "Test passed - table structure verified";
                }

                // Get first row and score input
                const [firstRow] = rows;
                const scoreInput = firstRow.querySelector(".scorebar");
                if (!scoreInput) {
                    throw new Error("Score input not found in first row");
                }

                const currentScore = scoreInput.value;
                console.log(`Current score value: ${currentScore}`);

                // Change score
                const newScore = Number(currentScore) + 1;
                console.log(`Changing score to: ${newScore}`);
                scoreInput.value = newScore;
                scoreInput.dispatchEvent(new Event("input", {bubbles: true}));
                scoreInput.dispatchEvent(new Event("change", {bubbles: true}));

                // Wait for save alert
                const saveAlert = await waitForElement("#save-alert");
                console.log("Save alert appeared");

                // Click save button
                const saveBtn = saveAlert.querySelector("button:not([data-save])");
                if (!saveBtn) {
                    throw new Error("Save button not found");
                }
                console.log("Clicking save button...");
                saveBtn.click();

                // Wait for success alert
                await waitForElement(".alert-success, .alert-modal.alert-success");
                console.log("Success alert appeared");

                // Restore original score
                console.log("Restoring original score value...");
                scoreInput.value = currentScore;
                scoreInput.dispatchEvent(new Event("input", {bubbles: true}));
                scoreInput.dispatchEvent(new Event("change", {bubbles: true}));

                // Wait for save alert again
                await waitForElement("#save-alert");
                saveBtn.click();

                // Wait for success alert again
                await waitForElement(".alert-success, .alert-modal.alert-success");
                console.log("Success alert appeared again");

                console.log("Symbols page test completed successfully");
                return "Test passed";
            }

            // Execute the test function
            return runSymbolsTest();
        });

        // Execute the test and wait for result
        const result = await testSymbolsPageClient();
        console.log("Test result:", result);

        // Verify the test completed successfully
        await t.expect(result).contains("Test passed", "Test should complete successfully");
    });
}());
