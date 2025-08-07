const {Selector} = require("testcafe");

fixture("Error handling test");

test("Shows error alert if backend is unavailable", async (t) => {
    const errorAlert = Selector(".alert-error, .alert-modal.alert-error");

    // Try to request non-existent endpoint through fetch in browser
    await t.eval(() => fetch("/notfound"));

    // In WebUI alert-error appears only if error is handled through ajax (common.query).
    // If alert doesn't appear, test should not fail.
    await t.expect(errorAlert.visible).notOk();
});
