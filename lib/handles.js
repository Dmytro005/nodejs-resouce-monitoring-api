const _data = require("./data");
const helpers = require("./helpers");
const config = require("./config");

// Define all the handlers
const handlers = {};

/**
 *
 * HTML handlers
 *
 */
// Base directory page
handlers.index = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Uptime monitoring - Made Simple",
            "head.description":
                "We offer free simle uptime monitorring for HTTP/HTTPS sites. When your site goes down we send you sms message",
            "body.class": "index"
        };

        // Read in a template as a sting
        helpers.getTemplate("index", templateData, function(err, indexStr) {
            if (!err && indexStr) {
                helpers.addUniversalTemplates(indexStr, templateData, function(
                    err,
                    readyStr
                ) {
                    if (!err && readyStr) {
                        callback(200, readyStr, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, "html");
            }
        });
    } else {
        callback(405, undefined, "html");
    }
};

// Public assets
handlers.public = function(data, callback) {
    if (data.method === "get") {
        // Get the file that was requested
        const trimmedAssetName = data.trimmedPath.replace("public/", "").trim();
        if (trimmedAssetName.length > 0) {
            // Read in the assets data
            helpers.readStaticAsset(trimmedAssetName, function(err, data) {
                if (!err && data) {
                    // Determine the content type (plain text by defautlt)
                    let contentType = "plain";

                    if (trimmedAssetName.indexOf(".css") > -1) {
                        contentType = "css";
                    }
                    if (trimmedAssetName.indexOf(".png") > -1) {
                        contentType = "png";
                    }
                    if (trimmedAssetName.indexOf(".jpg") > -1) {
                        contentType = "jpg";
                    }
                    if (trimmedAssetName.indexOf(".ico") > -1) {
                        contentType = "favicon";
                    }

                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(404);
        }
    } else {
        callback(405, undefined, "html");
    }
};

// Create account page
handlers.accountCreate = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Create an account",
            "head.description": "Sign up is easy an only takes a few seccond",
            "body.class": "accountCreate"
        };

        // Read in a template as a sting
        helpers.getTemplate("accountCreate", templateData, function(
            err,
            indexStr
        ) {
            if (!err && indexStr) {
                helpers.addUniversalTemplates(indexStr, templateData, function(
                    err,
                    readyStr
                ) {
                    if (!err && readyStr) {
                        callback(200, readyStr, "html");
                    } else {
                        callback(500, undefined, "html");
                    }
                });
            } else {
                callback(500, undefined, "html");
            }
        });
    } else {
        callback(405, undefined, "html");
    }
};

/**
 *
 * JSON API handlers
 *
 */

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

// Users handler
handlers.users = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Contaier for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, tosAgreement,
// Optional data: none
handlers._users.post = function(data, callback) {
    // Check all required fields

    let { firstName, lastName, phone, password, tosAgreement } = data.payload;

    firstName =
        typeof firstName == "string" && firstName.trim().length > 0
            ? firstName.trim()
            : false;
    lastName =
        typeof lastName == "string" && lastName.trim().length > 0
            ? lastName.trim()
            : false;
    phone =
        typeof phone == "string" && phone.trim().length === 10
            ? phone.trim()
            : false;
    password =
        typeof password == "string" && password.trim().length > 0
            ? password.trim()
            : false;
    tosAgreement =
        typeof tosAgreement == "boolean" && tosAgreement === true
            ? true
            : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that hte user dosen`t already exist
        _data.read("users", phone, function(err, data) {
            if (err) {
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    //Create suer object
                    const userObject = {
                        firstName,
                        lastName,
                        phone,
                        hashedPassword,
                        tosAgreement: true
                    };

                    //Store the user
                    _data.create("users", phone, userObject, function(
                        err,
                        data
                    ) {
                        if (!err) {
                            callback(200);
                        } else {
                            console.error(err);
                            callback(500, {
                                Error: "Could not create the new user"
                            });
                        }
                    });
                } else {
                    callback(500, {
                        Error: "Could not hash the user`s password"
                    });
                }
            } else {
                console.error(err);
                callback(400, { Error: "User already exist" });
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Users - get
// Required data: phone
handlers._users.get = function(data, callback) {
    // Check phone number is valid
    let { phone } = data.queryStringObject;

    phone =
        typeof phone == "string" && phone.trim().length === 10
            ? phone.trim()
            : false;

    if (phone) {
        // Get token from headers
        const token =
            typeof data.headers.token == "string" ? data.headers.token : false;
        // VerifyToken that the given token is valid
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", phone, function(err, data) {
                    if (!err && data) {
                        //Remove hashed password before sending it back
                        delete data.hashedPassword;

                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(400, { Error: "Invalid token" });
            }
        });
    } else {
        callback(400, { Error: "Missing required fields" });
    }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, tosAgreement, password
handlers._users.put = function(data, callback) {
    let { phone, firstName, lastName, password } = data.payload;

    phone =
        typeof phone == "string" && phone.trim().length === 10
            ? phone.trim()
            : false;

    firstName =
        typeof firstName == "string" && firstName.trim().length > 0
            ? firstName.trim()
            : false;
    lastName =
        typeof lastName == "string" && lastName.trim().length > 0
            ? lastName.trim()
            : false;
    password =
        typeof password == "string" && password.trim().length > 0
            ? password.trim()
            : false;

    // If phone is valid
    if (phone) {
        // If at least one field is present
        if (firstName || lastName || password) {
            const token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;
            // VerifyToken that the given token is valid
            handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
                if (tokenIsValid) {
                    _data.read("users", phone, function(err, data) {
                        if (!err) {
                            if (firstName) {
                                data.firstName = firstName;
                            }
                            if (lastName) {
                                data.lastName = lastName;
                            }
                            if (password) {
                                data.hashedPassword = helpers.hash(password);
                            }

                            _data.update("users", phone, data, function(
                                err,
                                data
                            ) {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        Error: "Could not update the user"
                                    });
                                }
                            });
                        } else {
                            callback(400, { Error: "User was not found" });
                        }
                    });
                } else {
                    callback(400, { Error: "Invalid token" });
                }
            });
        } else {
            callback(400, { Error: "Missing field to update" });
        }
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Users - delete
// Required data: phone
handlers._users.delete = function(data, callback) {
    // Check phone number is valid
    let { phone } = data.payload;

    phone =
        typeof phone == "string" && phone.trim().length === 10
            ? phone.trim()
            : false;

    if (phone) {
        const token =
            typeof data.headers.token == "string" ? data.headers.token : false;
        // VerifyToken that the given token is valid
        handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
            if (tokenIsValid) {
                _data.read("users", phone, function(err, userData) {
                    if (!err && userData) {
                        _data.delete("users", phone, function(err) {
                            if (!err) {
                                // Delete all users checks
                                const userChecks =
                                    typeof userData.checks === "object" &&
                                    userData.checks instanceof Array
                                        ? userData.checks
                                        : [];
                                const checksToDelete = userChecks.length;

                                if (checksToDelete > 0) {
                                    let cheksDeleted = 0;
                                    let deletionErrors = false;
                                    // Loop throught the checks
                                    userChecks.forEach(checkId => {
                                        _data.delete(
                                            "checks",
                                            checkId,
                                            function(err) {
                                                if (!err) {
                                                    cheksDeleted++;
                                                    if (
                                                        cheksDeleted ===
                                                        checksToDelete
                                                    ) {
                                                        if (!deletionErrors) {
                                                            callback(200);
                                                        } else {
                                                            callback(500, {
                                                                Error:
                                                                    "Errors encountered while attemption to delete cheks, some of them might not be delete"
                                                            });
                                                        }
                                                    }
                                                } else {
                                                    deletionErrors = true;
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(
                                    500,
                                    "Could not delete the specified user"
                                );
                            }
                        });
                    } else {
                        callback(400, {
                            Error: "Could not find specified user"
                        });
                    }
                });
            } else {
                callback(400, { Error: "Invalid token" });
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Tokens methods
handlers.tokens = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Tokens container
handlers._tokens = {};

// Tokens post
// Reqired data: phone, token
handlers._tokens.post = function(data, callback) {
    let { phone, password } = data.payload;
    phone =
        typeof phone == "string" && phone.trim().length === 10
            ? phone.trim()
            : false;
    password =
        typeof password == "string" && password.trim().length > 0
            ? password.trim()
            : false;

    if (phone && password) {
        _data.read("users", phone, function(err, data) {
            if (!err) {
                // Hash sent password and compare it with stored password
                const hashedPassword = helpers.hash(password);
                if (hashedPassword === data.hashedPassword) {
                    const tokenId = helpers.createRamdomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires
                    };
                    _data.create("tokens", tokenId, tokenObject, function(err) {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                Error: "Could not create a new token"
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: "Password did not match with specified users"
                    });
                }
            } else {
                callback(400, { Error: "Could not find specify user" });
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Tokens get
// Reqired data: tokenId
handlers._tokens.get = function(data, callback) {
    // Check phone number is valid
    let { tokenId } = data.queryStringObject;

    tokenId =
        typeof tokenId == "string" && tokenId.trim().length === 20
            ? tokenId.trim()
            : false;

    if (tokenId) {
        _data.read("tokens", tokenId, function(err, data) {
            if (!err && data) {
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Tokens put
// Required fields: id, extend
handlers._tokens.put = function(data, callback) {
    let { extend, tokenId } = data.payload;

    tokenId =
        typeof tokenId == "string" && tokenId.trim().length === 20
            ? tokenId.trim()
            : false;
    extend = typeof extend == "boolean" && extend === true ? true : false;

    if (tokenId && extend) {
        _data.read("tokens", tokenId, function(err, data) {
            if (!err && data) {
                // Make sure that token isn`t expired
                if (data.expires > Date.now()) {
                    // Store the new update an hour from now
                    data.expires = Date.now() + 1000 * 60 * 60;

                    //Store the new updates
                    _data.update("tokens", tokenId, data, function(err, data) {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {
                                Error: "Could not update token`s expiration"
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Token:
                            "The token has already expired and can not be extended"
                    });
                }
            } else {
                callback(400, { Token: "Specified token does not exist" });
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Tokens delete
// Required fields: tokenId
handlers._tokens.delete = function(data, callback) {
    let { tokenId } = data.payload;

    tokenId =
        typeof tokenId == "string" && tokenId.trim().length === 20
            ? tokenId.trim()
            : false;

    if (tokenId) {
        _data.read("tokens", tokenId, function(err, data) {
            if (!err && data) {
                _data.delete("tokens", tokenId, function(err) {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, "Could not delete the specified token");
                    }
                });
            } else {
                callback(400, { Error: "Could not find specified token" });
            }
        });
    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Token verify
// Required data:
// Details: Verofy if given token is valid for given user
handlers._tokens.verifyToken = function(tokenId, phone, callback) {
    _data.read("tokens", tokenId, function(err, data) {
        if (!err && data) {
            if (data.phone === phone && data.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Checks handler
handlers.checks = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};

//Container for checks methods
handlers._checks = {};

// Checks - post
// Required fields: protocol, url, method, succesCodes, timeoutSecconds.
// Optional data: none.
handlers._checks.post = function(data, callback) {
    let { protocol, url, method, successCodes, timeoutSecconds } = data.payload;

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

    if (protocol && url && method && successCodes && timeoutSecconds) {
        const token =
            typeof data.headers.token == "string" ? data.headers.token : false;

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
                                timeoutSecconds
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
                                                    callback(200, checkObject);
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
                                            Error: "Could not create a check"
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
};

// Checks - post
// Required fields: checkId
handlers._checks.get = function(data, callback) {
    // Check phone number is valid
    let { id } = data.queryStringObject;

    id = typeof id == "string" && id.trim().length === 20 ? id.trim() : false;

    if (id) {
        // Get token from headers
        _data.read("checks", id, function(err, checkData) {
            if (!err && checkData) {
                const token =
                    typeof data.headers.token == "string"
                        ? data.headers.token
                        : false;
                // VerifyToken that the given token is valid
                handlers._tokens.verifyToken(
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
};

// Checks - put
// Required data: id
// Optionall data: protocol, url, method, succesCodes, timeoutSecconds.
handlers._checks.put = function(data, callback) {
    let {
        id,
        protocol,
        url,
        method,
        successCodes,
        timeoutSecconds
    } = data.payload;

    id = typeof id == "string" && id.trim().length === 20 ? id.trim() : false;

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

    // Check if id is valid
    if (id) {
        // Check if fields to update was provided
        if (protocol || url || method || successCodes || timeoutSecconds) {
            // Check if record exists
            _data.read("checks", id, function(err, checkData) {
                if (!err && checkData) {
                    const token =
                        typeof data.headers.token == "string"
                            ? data.headers.token
                            : false;
                    // VerifyToken that the given token is valid
                    handlers._tokens.verifyToken(
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
                                if (timeoutSecconds) {
                                    checkData.timeoutSecconds = timeoutSecconds;
                                }

                                _data.update("checks", id, checkData, function(
                                    err
                                ) {
                                    if (!err) {
                                        callback(200);
                                    } else {
                                        callback(500, {
                                            Error: "Could not update the check"
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
            callback(400, {
                Error: "At least one field to update must be privided"
            });
        }
    } else {
        callback(400, { Error: "Check id is not valid" });
    }
};

// Checks - put
// Required data: id
// Optionall data: protocol, url, method, succesCodes, timeoutSecconds.
handlers._checks.delete = function(data, callback) {
    let { id } = data.payload;

    id = typeof id == "string" && id.trim().length === 20 ? id.trim() : false;

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
                handlers._tokens.verifyToken(
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
                                                        function(err, data) {
                                                            if (!err) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    Error:
                                                                        "Could not update the user"
                                                                });
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
                                                    Error: "Could not find user"
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
};

// Check - get
// Required data:
handlers._checks.get;

module.exports = handlers;
