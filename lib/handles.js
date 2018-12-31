const _data = require("./data");
const helpers = require("./helpers");

// Define all the handlers
const handlers = {};

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
            typeof data.headers.token == "string" ? data.headers.token : false;
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
        
                            _data.update("users", phone, data, function(err, data) {
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
            if(tokenIsValid) {

                _data.read("users", phone, function(err, data) {
                    if (!err && data) {
                        _data.delete("users", phone, function(err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, "Could not delete the specified user");
                            }
                        });
                    } else {
                        callback(400, { Error: "Could not find specified user" });
                    }
                });

            } else {
                callback(400, { Error: "Invalid token" });
            }
        })

    } else {
        callback(400, { Error: "Missing reqired fields" });
    }
};

// Ping handler
handlers.ping = function(data, callback) {
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback) {
    callback(404);
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

module.exports = handlers;
