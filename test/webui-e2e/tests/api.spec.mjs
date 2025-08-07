import {expect, request, test} from "@playwright/test";

// eslint-disable-next no-unused-vars
test("API /stat endpoint is available and returns version", async ({page}, testInfo) => {
    const {readOnlyPassword} = testInfo.project.use.rspamdPasswords;

    const api = await request.newContext();
    const response = await api.get("/stat", {headers: {Password: readOnlyPassword}});
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("version");
});
