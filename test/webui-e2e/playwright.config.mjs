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
    retries: 1,
    testDir: "./tests",
    timeout: 30000,
    reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
};

export default config;
