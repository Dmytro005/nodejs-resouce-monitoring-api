/**
 *
 * Worker realsted tasks
 *
 */

//Dependecies
const https = require("https");
const http = require("http");
const url = require("url");
const util = require("util");
const debug = util.debuglog("workers");

const _data = require("./data");
const _logs = require("./logs");
const helpers = require("./helpers");

//Instantiate workers
const workers = {};

// Lopp all the checks get ther data and send to a validator
workers.gatherAllChecks = function() {
    _data.list("checks", function(err, checks) {
        if ((!err, !checks, checks.length > 0)) {
            checks.forEach(check => {
                // Read in the check data
                _data.read("checks", check, function(err, originalCheckData) {
                    if (!err && originalCheckData) {
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug({
                            Error: "Can not read once of the check data"
                        });
                    }
                });
            });
        } else {
            debug({ Error: "Could not find any checks to process" });
        }
    });
};

// Sanity-checking the data check

workers.validateCheckData = function(originalCheckData) {
    originalCheckData =
        typeof originalCheckData === "object" && originalCheckData !== null
            ? originalCheckData
            : {};

    let {
        id,
        userPhone,
        protocol,
        url,
        method,
        successCodes,
        timeoutSecconds,
        state,
        lastCkecked
    } = originalCheckData;

    id = typeof id === "string" && id.trim().length === 20 ? id.trim() : false;

    userPhone =
        typeof userPhone == "string" && userPhone.trim().length === 10
            ? userPhone.trim()
            : false;

    protocol =
        typeof protocol === "string" && ["http", "https"].indexOf(protocol) > -1
            ? protocol
            : false;

    url = typeof url == "string" && url.trim().length > 0 ? url.trim() : false;

    method =
        typeof method === "string" &&
        ["post", "get", "put", "delete"].indexOf(method) > -1
            ? method
            : false;

    successCodes =
        typeof successCodes === "object" && successCodes instanceof Array
            ? successCodes
            : false;

    timeoutSecconds =
        typeof timeoutSecconds == "number" &&
        timeoutSecconds % 1 === 0 &&
        timeoutSecconds >= 1 &&
        timeoutSecconds < 5
            ? timeoutSecconds
            : false;

    // Set the keys that may not been set (if the woker performs the check at first time)

    state =
        typeof state === "string" && ["up", "down"].indexOf(state) > -1
            ? state
            : "down";

    lastCkecked =
        typeof lastCkecked === "number" && lastCkecked > 0
            ? lastCkecked
            : false;

    // If all the checks pass, pass the check data along to next step

    if (
        id &&
        userPhone &&
        protocol &&
        url &&
        method &&
        successCodes &&
        timeoutSecconds
    ) {
        workers.performCheck({
            id,
            userPhone,
            protocol,
            url,
            method,
            successCodes,
            timeoutSecconds,
            state,
            lastCkecked
        });
    } else {
        debug({ Error: "One of the checks is not properly formated" });
    }
};

//Perform the checks with originall data and sent the check to the next step in the process
workers.performCheck = function(originalCheckData) {
    // Prepare the initial check outcome
    let checkOutcome = {
        error: false,
        respondeCode: false
    };

    let outcomeSent = false;

    // Parse the hostname and the path out from the originall check data
    const parsedURL = url.parse(
        originalCheckData.protocol + "://" + originalCheckData.url,
        true
    );

    const hostName = parsedURL.hostname;
    const path = parsedURL.path; //Using path not 'pathname' because it`s important to include query string

    const requestDetails = {
        protocol: originalCheckData.protocol + ":",
        hostname: hostName,
        method: originalCheckData.method.toUpperCase(),
        path: path,
        timeout: originalCheckData.timeoutSecconds + 1000
    };

    // Instantiate the request object (using either http or https modules)

    const _moduleToUse = originalCheckData.protocol === "http" ? http : https;
    const req = _moduleToUse.request(requestDetails, function(res) {
        // Grab the status of sent request
        const status = res.statusCode;

        checkOutcome.respondeCode = status;

        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }

        // Bind to the err event
        req.on("error", function(e) {
            checkOutcome.error = {
                err: true,
                value: e
            };
            if (!outcomeSent) {
                workers.processCheckOutcome(originalCheckData, checkOutcome);
                outcomeSent = true;
            }
        });

        // Bind to the timeout event
        req.on("error", function(e) {
            checkOutcome.error = {
                err: true,
                value: "timeout"
            };
            if (!outcomeSent) {
                workers.processCheckOutcome(originalCheckData, checkOutcome);
                outcomeSent = true;
            }
        });
    });

    req.end();
};

// Process the check outcome and update the check data if needed as needed and trigger an alert to user
// Special logic for accomodating the check that has never been tested before (check with default down value
workers.processCheckOutcome = function(originalCheckData, checkOutcome) {
    // Decide if the check is considered up or down
    const state =
        !checkOutcome.error &&
        originalCheckData.successCodes.indexOf(checkOutcome.respondeCode) > -1
            ? "up"
            : "down";

    // Decide if the alert is wanted

    const alertWarranted =
        originalCheckData.lastCkecked && originalCheckData.state !== state
            ? true
            : false;

    // Update the check data
    const newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastCkecked = Date.now();

    //Log the outcome
    const timeOfCheck = Date.now();

    workers.log(
        originalCheckData,
        checkOutcome,
        state,
        alertWarranted,
        timeOfCheck
    );

    // Save hte updates to disk
    _data.update("checks", newCheckData.id, newCheckData, function(err) {
        if (!err) {
            if (alertWarranted) {
                workers.alertUserToStatusChange(newCheckData);
            } else {
                debug("Outcome has not changed no alert is needed");
            }
        } else {
            debug({ Error: "Cannot save one of the checks" });
        }
    });
};

// Alert user about status change of ther check
workers.alertUserToStatusChange = function(newCheckData) {
    const { method, protocol, url, state } = newCheckData;
    const msg =
        "Alert: your check for " +
        method.toUpperCase() +
        " " +
        protocol +
        "://" +
        url +
        " is currently " +
        state;

    helpers.sendTwilioSMS(newCheckData.userPhone, msg, function(err) {
        if (!err) {
            debug(
                "Success: User was alerted to the satus change via sms: ",
                msg
            );
        } else {
            debug(
                "Error: Could not send sms alert to the user who had a state change"
            );
        }
    });
};

// Function that logs the the outcome of each check
workers.log = function(
    originalCheckData,
    checkOutcome,
    state,
    alertWarranted,
    timeOfCheck
) {
    // From the log data
    const logData = {
        check: originalCheckData,
        outcome: checkOutcome,
        state,
        alert: alertWarranted,
        time: timeOfCheck
    };

    // Convert data to a string
    const logString = JSON.stringify(logData);

    // Determine the name of the log file
    const logFielName = originalCheckData.id;

    _logs.append(logFielName, logString, function(err, data) {
        if (!err) {
            debug("Logging to file succeded");
        } else {
            debug("Loggin to file failed");
        }
    });
};

workers.rotateLogs = function() {
    // List all the non compressed log files

    _logs.list(false, function(err, logs) {
        if (!err && logs && logs.length > 0) {
            logs.forEach(function(logName) {
                const logId = logName.replace(".log", "");
                const newFileId = logId + "-" + Date.now();

                _logs.compress(logId, newFileId, function(err) {
                    if (!err) {
                        // Truncate the logs (emptiing current log file)
                        _logs.truncate(logId, function() {
                            if (!err) {
                                debug("Success truncating log file");
                            } else {
                                debug(
                                    "Could not truncete current log file",
                                    err
                                );
                            }
                        });
                    } else {
                        debug("Could not compress logs", err);
                    }
                });
            });
        } else {
            debug("Cannot list all the logs");
        }
    });
};

// Timer to execute worker once per minute
workers.loop = function() {
    setInterval(function() {
        workers.gatherAllChecks();
    }, 1000 * 5);
};

workers.logRotationLoop = function() {
    setInterval(function() {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};

workers.init = function() {
    // Execute all the cheks

    console.log("\x1b[33m%s\x1b[0m", "Workers succeessfult started");

    // Execute all checks immidiately
    workers.gatherAllChecks();

    // Call the loop so the ckeks will ecute later on
    workers.loop();

    // Compress all the lgs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
};

// Export the module
module.exports = workers;
