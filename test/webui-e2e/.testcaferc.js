/* global module */
module.exports = {
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
