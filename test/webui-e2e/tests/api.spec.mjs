import {expect, request, test} from "@playwright/test";

test("API /stat endpoint is available and returns version", async () => {
    const api = await request.newContext();
    const response = await api.get("http://localhost:11334/stat");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty("version");
});
