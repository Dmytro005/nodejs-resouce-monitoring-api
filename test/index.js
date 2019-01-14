/**
 *
 * Test runner
 *
 */

// Override NODE_ENV
process.env.NODE_ENV = "testing";

const _app = {};

_app.tests = {
    unit: require("./unit"),
    api: require("./api")
};

// Count the complete number of tests
_app.countTests = function() {
    let counter = 0;
    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            let subTests = _app.tests[key];
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }
    return counter;
};

// Run all the test collecting all the results
_app.runTests = function() {
    let errors = [];
    let successCounter = 0;
    let limit = _app.countTests();
    let counter = 0;

    console.log("\x1b[33m%s\x1b[0m", "Starts tests: \n");

    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            let subTest = _app.tests[key];

            for (let testName in _app.tests[key]) {
                // (function() {
                let tempTestName = testName;
                let testValue = subTest[testName];
                try {
                    // Call the test
                    testValue(function() {
                        // If this function is called, the test is succedded
                        console.log("\x1b[32mPassed: %s\x1b[0m", tempTestName);
                        counter++;
                        successCounter++;
                        if (counter === limit) {
                            _app.produceTestReport(
                                limit,
                                successCounter,
                                errors
                            );
                        }
                    });
                } catch (error) {
                    console.log("catched", error);

                    // Capture the failed test
                    errors.push({ name: testName, error });
                    console.log("\x1b[31mFailed: %s\x1b[0m", tempTestName);
                    counter++;
                    if (counter === limit) {
                        _app.produceTestReport(limit, successCounter, errors);
                    }
                }
                // })();
            }
        }
    }
};

// Produce a test outccome report
_app.produceTestReport = function(limit, successCounter, errors) {
    console.log("");
    console.log(
        "\x1b[33m%s\x1b[0m",
        "---------------BEGIN TEST REPORT----------------"
    );
    console.log("Total tests: ", limit);
    console.log(`\x1b[32mPassed: ${successCounter}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${errors.length}\x1b[0m`);
    console.log("");
    if (errors.length > 0) {
        console.log("---------------BEGIN ERROR DETAILS----------------");
        console.log("");

        errors.forEach(error => {
            console.log("\x1b[31m%s\x1b[0m", error.name);
            console.log(error.error);
            console.log("");
        });

        console.log("-----------------END ERROR DETAILS----------------");
    }
    console.log("");
    console.log(
        "\x1b[33m%s\x1b[0m",
        "------------- END OF A TEST REPORT--------------"
    );
    process.exit(0);
};

// Run the tests
_app.runTests();
