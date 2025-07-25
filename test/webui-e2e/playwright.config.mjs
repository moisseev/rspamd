/** @type {import("@playwright/test").PlaywrightTestConfig} */
const config = {
    projects: [
        {
            name: "firefox",
            use: {browserName: "firefox"}
        },
        {
            name: "chromium",
            use: {browserName: "chromium"}
        }
    ],
    reporter: [["html", {open: "never", outputFolder: "playwright-report"}]],
    retries: 1,
    testDir: "./tests",
    timeout: 30000,
};

export default config;
