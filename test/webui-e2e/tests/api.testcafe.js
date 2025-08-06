/* global process */
fixture("API test");

// eslint-disable-next-line require-await
test("Debug baseUrl configuration", async (t) => {
    console.log("t.testRun.opts.baseUrl:", t.testRun.opts.baseUrl);
});

test("API /stat endpoint is available and returns version", async (t) => {
    const response = await t.request(`${process.env.URL}/stat`);
    if (response.status !== 200) {
        throw new Error(`Unexpected status: ${response.status}, body: ${JSON.stringify(response.body)}`);
    }
    await t.expect(response.status).eql(200);
    await t.expect(response.body).ok();
    await t.expect(response.body.version).ok();
});
