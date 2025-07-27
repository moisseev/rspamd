(function () {
    "use strict";
    const {Selector} = require("testcafe");

    fixture("Main page test")
        .page("http://host.docker.internal:11334");

    test("Main page is accessible and shows dashboard", async (t) => {
        const navBar = Selector("#navBar");
        const statusNav = Selector("#status_nav");
        const symbolsNav = Selector("#symbols_nav");
        const configNav = Selector("#configuration_nav");
        const historyNav = Selector("#history_nav");

        await t.expect(t.eval(() => document.title)).contains("Rspamd Web Interface");
        await t.expect(navBar.visible).ok();
        await t.expect(statusNav.visible).ok();
        await t.expect(symbolsNav.visible).ok();
        await t.expect(configNav.visible).ok();
        await t.expect(historyNav.visible).ok();
    });
}());
