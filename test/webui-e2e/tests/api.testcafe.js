/* global process */
console.log("Environment variables:", {
    BASE_URL: process.env.BASE_URL || "not set"
});

try {
    const testCafePath = require.resolve("testcafe");
    console.log("TestCafe module path:", testCafePath);


    const TestCafeRunner = require("testcafe/lib/runner");
    console.log("TestCafe runner configuration:");
    if (TestCafeRunner && TestCafeRunner.configuration) {
        console.log("baseUrl:", TestCafeRunner.configuration.baseUrl);
    }
} catch (error) {
    console.log("Error accessing TestCafe configuration:", error.message);
}

fixture("API test").page("/");

test("API /stat endpoint is available and returns version", async (t) => {
    const response = await t.request("/stat");
    if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}, body: ${JSON.stringify(response.body)}`);
    }
    await t.expect(response.status).eql(200);
    await t.expect(response.body).ok();
    await t.expect(response.body.version).ok();
});
