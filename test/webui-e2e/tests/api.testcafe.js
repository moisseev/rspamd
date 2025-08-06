/* global process */
console.log("Environment variables:", {
    BASE_URL: process.env.BASE_URL || "not set"
});

try {
    try {
        const config = require("testcafe/lib/configuration");
        console.log("baseUrl from testcafe/lib/configuration:",
            config && config.default && config.default.getOption("baseUrl"));
    } catch (e) {
        console.log("Could not access testcafe/lib/configuration");
    }

    try {
        const config = require("testcafe/lib/configuration/config");
        console.log("baseUrl from testcafe/lib/configuration/config:",
            config && config.default && config.default.baseUrl);
    } catch (e) {
        console.log("Could not access testcafe/lib/configuration/config");
    }
} catch (error) {
    console.log("Error accessing TestCafe configuration:", error.message);
}

fixture("API test");

// eslint-disable-next-line require-await
test("Debug baseUrl configuration", async (t) => {
    console.log("t.testRun.opts.baseUrl:", t.testRun.opts.baseUrl);
});

test("API /stat endpoint is available and returns version", async (t) => {
    const response = await t.request("/stat");
    if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}, body: ${JSON.stringify(response.body)}`);
    }
    await t.expect(response.status).eql(200);
    await t.expect(response.body).ok();
    await t.expect(response.body.version).ok();
});
