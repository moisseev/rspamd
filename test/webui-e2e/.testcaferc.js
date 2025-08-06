/* global module */
module.exports = {
    baseUrl: "http://rspamd-container:11334",
    disablePageCaching: true,
    screenshots: {
        path: "screenshots",
        takeOnFails: true,
        takeOnError: true,
        thumbnails: false,
        // eslint-disable-next-line no-template-curly-in-string
        pathPattern: "${DATE}_${TIME}/${FULLNAME}.png",
        // eslint-disable-next-line no-template-curly-in-string
        pathPatternOnFails: "${DATE}_${TIME}/failedTests/${FULLNAME}.png",
        takeOnSuccess: true
    }
};
