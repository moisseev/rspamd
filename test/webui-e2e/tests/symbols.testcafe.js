"use strict";

const {ClientFunction} = require("testcafe");

function testSymbolsPage() {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        function waitForTable() {
            const table = document.getElementById("symbolsTable");
            if (!table) {
                if (Date.now() - start > 10000) {
                    reject(new Error("Table not found"));
                    return;
                }
                setTimeout(waitForTable, 100);
                return;
            }

            // visible rows in tbody (offsetParent !== null means visible)
            const rows = Array.from(table.querySelectorAll("tbody tr")).filter(
                row => row.offsetParent !== null
            );

            if (rows.length === 0) {
                if (Date.now() - start > 10000) {
                    reject(new Error("No visible rows"));
                    return;
                }
                setTimeout(waitForTable, 100);
                return;
            }

            proceed(table, rows);
        }

        function waitForSaveButtonVisibleAndEnabled() {
            return new Promise((resolve, reject) => {
                const start = Date.now();

                function check() {
                    const btn = document.querySelector("#save-alert button:not([data-save])");
                    if (
                        btn &&
                        btn.offsetParent !== null && // visible
                        !btn.disabled
                    ) {
                        resolve();
                        return;
                    }
                    if (Date.now() - start > 5000) {
                        reject(new Error("Save button not visible or disabled"));
                        return;
                    }
                    setTimeout(check, 100);
                }

                check();
            });
        }

        function waitSuccessAlert() {
            return new Promise((resolve, reject) => {
                const start = Date.now();

                function check() {
                    const alert = document.querySelector(".alert-success, .alert-modal.alert-success");
                    if (alert && alert.offsetParent !== null) {
                        resolve();
                        return;
                    }
                    if (Date.now() - start > 5000) {
                        reject(new Error("Success alert did not appear"));
                        return;
                    }
                    setTimeout(check, 100);
                }

                check();
            });
        }

        function proceed(table, rows) {
            if (rows.length === 0) {
                reject(new Error("No visible rows in symbols table"));
                return;
            }

            const firstRow = rows[0];
            const firstCell = firstRow.querySelector("td");
            if (!firstCell || !firstCell.textContent.trim()) {
                reject(new Error("First cell is empty"));
                return;
            }

            const scoreInput = table.querySelector(".scorebar");
            const saveBtn = document.querySelector("#save-alert button:not([data-save])");

            if (!scoreInput) {
                reject(new Error("Score input not found"));
                return;
            }
            if (!saveBtn) {
                reject(new Error("Save button not found"));
                return;
            }

            const oldValue = scoreInput.value;

            // Изменяем значение и вызываем события вручную
            scoreInput.value = Number(oldValue) + 1;
            scoreInput.dispatchEvent(new Event("input", { bubbles: true }));
            scoreInput.dispatchEvent(new Event("change", { bubbles: true }));
            scoreInput.blur();

            waitForSaveButtonVisibleAndEnabled()
                .then(() => {
                    saveBtn.click();
                    return waitSuccessAlert();
                })
                .then(() => {
                    scoreInput.value = oldValue;
                    scoreInput.dispatchEvent(new Event("input", { bubbles: true }));
                    scoreInput.dispatchEvent(new Event("change", { bubbles: true }));
                    scoreInput.blur();

                    return waitForSaveButtonVisibleAndEnabled();
                })
                .then(() => {
                    saveBtn.click();
                    return waitSuccessAlert();
                })
                .then(() => resolve("Test passed"))
                .catch(reject);
        }

        waitForTable();
    });
}

const runTest = ClientFunction(testSymbolsPage);

fixture("Symbols page test").page("http://rspamd-container:11334/#symbols");

test("Symbols test", async (t) => {
    const result = await runTest();
    await t.expect(result).eql("Test passed");
});
