const _data = require("../../common/data");
const helpers = require("../../common/helpers");
const TokensController = require("./tokens");

const UsersController = {
    // Users - post
    // Required data: firstName, lastName, phone, tosAgreement,
    // Optional data: none
    post: function(data, callback) {
        // Check all required fields

        let {
            firstName,
            lastName,
            phone,
            password,
            tosAgreement
        } = data.payload;

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
    },

    // Users - get
    // Required data: phone
    get: function(data, callback) {
        // Check phone number is valid
        let { phone } = data.queryStringObject;

        phone =
            typeof phone == "string" && phone.trim().length === 10
                ? phone.trim()
                : false;

        if (phone) {
            // Get token from headers
            const token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;
            // VerifyToken that the given token is valid
            TokensController.verifyToken(token, phone, function(tokenIsValid) {
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
    },

    // Users - put
    // Required data: phone
    // Optional data: firstName, lastName, tosAgreement, password
    put: function(data, callback) {
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
                TokensController.verifyToken(token, phone, function(
                    tokenIsValid
                ) {
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
                                    data.hashedPassword = helpers.hash(
                                        password
                                    );
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
    },

    // Users - delete
    // Required data: phone
    delete: function(data, callback) {
        // Check phone number is valid
        let { phone } = data.payload;

        phone =
            typeof phone == "string" && phone.trim().length === 10
                ? phone.trim()
                : false;

        if (phone) {
            const token =
                typeof data.headers.token == "string"
                    ? data.headers.token
                    : false;
            // VerifyToken that the given token is valid
            TokensController.verifyToken(token, phone, function(tokenIsValid) {
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
                                                            if (
                                                                !deletionErrors
                                                            ) {
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
    }
};

module.exports = UsersController;
