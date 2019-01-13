const _data = require("../../common/data");
const helpers = require("../../common/helpers");
const config = require("../../config");
const TokensController = require("./tokens");

const ChecksController = {
    // Checks - post
    // Required fields: protocol, url, method, succesCodes, timeoutSeconds.
    // Optional data: none.
    post: function(data, callback) {
        let {
            protocol,
            url,
            method,
            successCodes,
            timeoutSeconds
        } = data.payload;

        protocol =
            typeof protocol === "string" &&
            ["http", "https"].indexOf(protocol) > -1
                ? protocol
                : false;

        url =
            typeof url == "string" && url.trim().length > 0
                ? url.trim()
                : false;

        method =
            typeof method === "string" &&
            ["post", "get", "put", "delete"].indexOf(method) > -1
                ? method
                : false;

        successCodes =
            typeof successCodes === "object" && successCodes instanceof Array
                ? successCodes
                : false;

        timeoutSeconds =
            typeof timeoutSeconds == "number" &&
            timeoutSeconds % 1 === 0 &&
            timeoutSeconds >= 1 &&
            timeoutSeconds < 5
                ? timeoutSeconds
                : false;

        if (protocol && url && method && successCodes && timeoutSeconds) {
            const token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;

            _data.read("tokens", token, function(err, tokenData) {
                if (!err && tokenData) {
                    const { phone } = tokenData;
                    // Look up users data
                    _data.read("users", phone, function(err, userData) {
                        if (!err && userData) {
                            let { checks } = userData;
                            checks =
                                typeof checks === "object" &&
                                checks instanceof Array
                                    ? checks
                                    : [];
                            // Verify that the users has max count of cheks
                            if (checks.length < config.maxChecks) {
                                // Create a check with user`s phone number
                                const checkId = helpers.createRamdomString(20);
                                const checkObject = {
                                    id: checkId,
                                    userPhone: phone,
                                    protocol,
                                    url,
                                    method,
                                    successCodes,
                                    timeoutSeconds
                                };

                                _data.create(
                                    "checks",
                                    checkId,
                                    checkObject,
                                    function(err) {
                                        if (!err) {
                                            // Add the check is to user object
                                            userData.checks = checks;
                                            userData.checks.push(checkId);

                                            _data.update(
                                                "users",
                                                phone,
                                                userData,
                                                function(err) {
                                                    if (!err) {
                                                        callback(
                                                            200,
                                                            checkObject
                                                        );
                                                    } else {
                                                        callback(500, {
                                                            Error:
                                                                "Could not save user checks"
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(500, {
                                                Error:
                                                    "Could not create a check"
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(400, {
                                    Error: "You`ve reached max amount of checks"
                                });
                            }
                        } else {
                            callback(400, { Error: "User wasn`t found" });
                        }
                    });
                } else {
                    callback(403, { Error: "Invalid token" });
                }
            });
        } else {
            callback(400, {
                Error: "Missing requierd inputs, or inputs are invalid"
            });
        }
    },

    // Checks - post
    // Required fields: checkId
    get: function(data, callback) {
        // Check phone number is valid
        let { id } = data.queryStringObject;

        id =
            typeof id == "string" && id.trim().length === 20
                ? id.trim()
                : false;

        if (id) {
            // Get token from headers
            _data.read("checks", id, function(err, checkData) {
                if (!err && checkData) {
                    const token =
                        typeof data.headers.token == "string"
                            ? data.headers.token
                            : false;
                    // VerifyToken that the given token is valid
                    TokensController.verifyToken(
                        token,
                        checkData.userPhone,
                        function(tokenIsValid) {
                            if (tokenIsValid) {
                                callback(200, checkData);
                            } else {
                                callback(403, { Error: "Invalid token" });
                            }
                        }
                    );
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, { Error: "Missing required fields" });
        }
    },

    // Checks - put
    // Required data: id
    // Optionall data: protocol, url, method, succesCodes, timeoutSeconds.
    put: function(data, callback) {
        let {
            id,
            protocol,
            url,
            method,
            successCodes,
            timeoutSeconds
        } = data.payload;

        id =
            typeof id == "string" && id.trim().length === 20
                ? id.trim()
                : false;

        protocol =
            typeof protocol === "string" &&
            ["http", "https"].indexOf(protocol) > -1
                ? protocol
                : false;

        url =
            typeof url == "string" && url.trim().length > 0
                ? url.trim()
                : false;

        method =
            typeof method === "string" &&
            ["post", "get", "put", "delete"].indexOf(method) > -1
                ? method
                : false;

        successCodes =
            typeof successCodes === "object" && successCodes instanceof Array
                ? successCodes
                : false;

        timeoutSeconds =
            typeof timeoutSeconds == "number" &&
            timeoutSeconds % 1 === 0 &&
            timeoutSeconds >= 1 &&
            timeoutSeconds < 5
                ? timeoutSeconds
                : false;

        // Check if id is valid
        if (id) {
            // Check if fields to update was provided
            if (protocol || url || method || successCodes || timeoutSeconds) {
                // Check if record exists
                _data.read("checks", id, function(err, checkData) {
                    if (!err && checkData) {
                        const token =
                            typeof data.headers.token == "string"
                                ? data.headers.token
                                : false;
                        // VerifyToken that the given token is valid
                        TokensController.verifyToken(
                            token,
                            checkData.userPhone,
                            function(tokenIsValid) {
                                if (tokenIsValid) {
                                    if (protocol) {
                                        checkData.protocol = protocol;
                                    }
                                    if (url) {
                                        checkData.url = url;
                                    }
                                    if (method) {
                                        checkData.method = method;
                                    }
                                    if (successCodes) {
                                        checkData.successCodes = successCodes;
                                    }
                                    if (timeoutSeconds) {
                                        checkData.timeoutSeconds = timeoutSeconds;
                                    }

                                    _data.update(
                                        "checks",
                                        id,
                                        checkData,
                                        function(err) {
                                            if (!err) {
                                                callback(200);
                                            } else {
                                                callback(500, {
                                                    Error:
                                                        "Could not update the check"
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(403, { Error: "Invalid token" });
                                }
                            }
                        );
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, {
                    Error: "At least one field to update must be privided"
                });
            }
        } else {
            callback(400, { Error: "Check id is not valid" });
        }
    },

    // Checks - put
    // Required data: id
    // Optionall data: protocol, url, method, succesCodes, timeoutSeconds.
    delete: function(data, callback) {
        let { id } = data.payload;

        id =
            typeof id == "string" && id.trim().length === 20
                ? id.trim()
                : false;

        // Check if id is valid
        if (id) {
            // Check if record exists
            _data.read("checks", id, function(err, checkData) {
                if (!err && checkData) {
                    const token =
                        typeof data.headers.token == "string"
                            ? data.headers.token
                            : false;
                    // VerifyToken that the given token is valid
                    TokensController.verifyToken(
                        token,
                        checkData.userPhone,
                        function(tokenIsValid) {
                            if (tokenIsValid) {
                                // Delete the check
                                _data.delete("checks", id, function(err) {
                                    if (!err) {
                                        _data.read(
                                            "users",
                                            checkData.userPhone,
                                            function(err, userData) {
                                                if (!err) {
                                                    const userChecks =
                                                        typeof userData.checks ===
                                                            "object" &&
                                                        userData.checks instanceof
                                                            Array
                                                            ? userData.checks
                                                            : [];
                                                    //Find index of deleted check
                                                    const checkPosition = userChecks.indexOf(
                                                        id
                                                    );
                                                    if (checkPosition > -1) {
                                                        //Remove deleted ckeck from users object
                                                        userChecks.splice(
                                                            checkPosition,
                                                            1
                                                        );
                                                        userData.checks = userChecks;

                                                        _data.update(
                                                            "users",
                                                            checkData.userPhone,
                                                            userData,
                                                            function(
                                                                err,
                                                                data
                                                            ) {
                                                                if (!err) {
                                                                    callback(
                                                                        200
                                                                    );
                                                                } else {
                                                                    callback(
                                                                        500,
                                                                        {
                                                                            Error:
                                                                                "Could not update the user"
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        callback(500, {
                                                            Error:
                                                                "Could not find the check on the users object so couldn`t remove it"
                                                        });
                                                    }
                                                } else {
                                                    callback(500, {
                                                        Error:
                                                            "Could not find user"
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(500, {
                                            Error: "Could not delete the check"
                                        });
                                    }
                                });
                            } else {
                                callback(403, { Error: "Invalid token" });
                            }
                        }
                    );
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, { Error: "Check id is not valid" });
        }
    }
};

module.exports = ChecksController;
