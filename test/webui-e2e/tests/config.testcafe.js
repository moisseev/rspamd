const {Selector} = require("testcafe");

fixture("Config page test")
    .page("http://rspamd-container:11334");

test("Config page: always checks order error and valid save for actions", async (t) => {
    const configNav = Selector("#configuration_nav");
    const actionsFormField = Selector("#actionsFormField");
    const saveActionsBtn = Selector("#saveActionsBtn");
    const errorAlert = Selector(".alert-error, .alert-modal.alert-error");

    // Wait for the Configuration tab to be enabled (not disabled)
    await t.expect(configNav.hasAttribute("disabled")).notOk("Configuration tab should be enabled");
    await t.expect(configNav.visible).ok("Configuration tab should be visible");

    await t.click(configNav);
    await t.expect(actionsFormField.visible).ok();

    // Get all action inputs
    const inputs = Selector("#actionsFormField input[data-id='action']");
    const count = await inputs.count;
    await t.expect(count).gt(0);

    // Check first input is visible
    await t.expect(inputs.nth(0).visible).ok();

    // Save original value of first input
    const originalValue = await inputs.nth(0).value;

    // Test with correct order (single input)
    await t.typeText(inputs.nth(0), "1", {replace: true});
    await t.click(saveActionsBtn);

    // Should not show error
    await t.expect(errorAlert.visible).notOk();

    // Reload page and verify value is saved
    await t.eval(() => location.reload());
    await t.click(configNav);

    const reloadedInputs = Selector("#actionsFormField input[data-id='action']");
    await t.expect(reloadedInputs.nth(0).visible).ok();

    const savedValue = await reloadedInputs.nth(0).value;
    await t.expect(savedValue).eql("1");

    // Test with invalid order (single input)
    await t.typeText(reloadedInputs.nth(0), "10", {replace: true});
    await t.click(saveActionsBtn);

    // Should show error for invalid order
    await t.expect(errorAlert.visible).ok();

    // Test with invalid value (negative number)
    await t.typeText(reloadedInputs.nth(0), "-5", {replace: true});
    await t.click(saveActionsBtn);

    // Should show error for invalid value
    await t.expect(errorAlert.visible).ok();

    // Restore original value
    await t.typeText(reloadedInputs.nth(0), originalValue, {replace: true});
    await t.click(saveActionsBtn);
});
