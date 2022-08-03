"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const APPVEYOR_API_URL = process.env.APPVEYOR_API_URL;
const ADD_TESTS_IN_BATCH = "api/tests/batch";
const isError = (r) => (r.failureMessages && r.failureMessages.length > 0);
const errorDetails = (testResult) => {
    if (!isError(testResult)) {
        return;
    }
    const [message, ...stack] = testResult.failureMessages[0].split("\n");
    return [message, stack.join("\n")];
};
const toAppveyorTest = (fileName) => (testResult) => {
    const [errorMessage, errorStack] = errorDetails(testResult) || [undefined, undefined];
    return {
        testName: testResult.fullName,
        testFramework: 'Jest',
        fileName: fileName,
        outcome: testResult.status,
        durationMilliseconds: testResult.duration,
        ErrorMessage: errorMessage,
        ErrorStackTrace: errorStack,
        StdOut: "",
        StdErr: ""
    };
};
class AppveyorReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }
    onTestResult(test, testResult) {
        if (!APPVEYOR_API_URL) {
            return;
        }
        const results = testResult.testResults.map(toAppveyorTest(test.path));
        const json = JSON.stringify(results);
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': json.length
            }
        };
        const req = http_1.request(APPVEYOR_API_URL + ADD_TESTS_IN_BATCH, options);
        req.on("error", (error) => console.error("Unable to post test result", { error }));
        req.write(json);
        req.end();
    }
}
module.exports = AppveyorReporter;
