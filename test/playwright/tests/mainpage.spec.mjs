import {expect, test} from "@playwright/test";
import {login} from "../helpers/auth.mjs";

test("Main page is accessible and shows dashboard", async ({page}, testInfo) => {
    const {readOnlyPassword} = testInfo.project.use.rspamdPasswords;

    await login(page, readOnlyPassword);

    await expect(page).toHaveTitle(/Rspamd Web Interface/i);
    await expect(page.locator("#navBar")).toBeVisible();
    await expect(page.locator("#status_nav")).toBeVisible();
    await expect(page.locator("#symbols_nav")).toBeVisible();
    await expect(page.locator("#configuration_nav")).toBeVisible();
    await expect(page.locator("#history_nav")).toBeVisible();
});
