(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("WebUI smoke test")
        .page("http://host.docker.internal:11334");

    test("should load WebUI and show main elements", async (t) => {
        const preloader = Selector("#preloader");
        const mainUI = Selector("#mainUI");
        const navBar = Selector("#navBar");
        const tablist = Selector("#tablist");
        const tabPane = Selector(".tab-pane");

        // Wait for preloader to be hidden
        await t.expect(preloader.visible).notOk({timeout: 30000});
        // Wait for main UI to be visible and not have d-none class
        await t.expect(mainUI.hasClass("d-none")).notOk({timeout: 30000});
        await t.expect(mainUI.visible).ok();
        // Check main navigation elements
        await t.expect(navBar.visible).ok();
        await t.expect(tablist.visible).ok();
        // Check that at least one tab panel is visible
        await t.expect(tabPane.count).eql(7);
    });
}());
