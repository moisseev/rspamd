(function () {
    "use strict";
    fixture("API test")
        .page("http://localhost:11334");

    test("API /stat endpoint is available and returns version", async (t) => {
        const response = await t.request("http://localhost:11334/stat");

        await t.expect(response.status).eql(200);
        await t.expect(response.body).hasProperty("version");
    });
}());
