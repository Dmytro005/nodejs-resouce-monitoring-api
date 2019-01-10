const helpers = require("./helpers");

// Define all the handlers
const handlers = {};

/**
 * General purpose handlers
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

handlers.favicon = function(data, callback) {
    // Reject any request that isn't a GET
    if (data.method == "get") {
        // Read in the favicon's data
        helpers.readStaticAsset("favicon.ico", function(err, data) {
            if (!err && data) {
                // Callback the data
                callback(200, data, "favicon");
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
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

// Session account page
handlers.sessionCreate = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Log into your account",
            "head.description":
                "Please enter your phone number and passowrd to log in",
            "body.class": "sessionCreate"
        };

        // Read in a template as a sting
        helpers.getTemplate("sessionCreate", templateData, function(
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

// Session has been deleted
handlers.sessionDeleted = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Logged out",
            "head.description": "Ypu have been logged out of your account",
            "body.class": "sessionDeleted"
        };

        // Read in a template as a sting
        helpers.getTemplate("sessionDeleted", templateData, function(
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

// Account has been deleted
handlers.accountDeleted = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Account deleted",
            "head.description": "Your account has been deleted",
            "body.class": "accountDeleted"
        };

        // Read in a template as a sting
        helpers.getTemplate("accountDeleted", templateData, function(
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

// Edit account page
handlers.accountEdit = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Account settings",
            "body.class": "accountEdit"
        };

        // Read in a template as a sting
        // debugger;
        helpers.getTemplate("accountEdit", templateData, function(
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

// Create a new check
handlers.checksCreate = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Create a new check",
            "body.class": "checksCreate"
        };

        // Read in a template as a sting
        // debugger;
        helpers.getTemplate("checksCreate", templateData, function(
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

// Dashboard:  Edit a check
handlers.checksEdit = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Check details",
            "body.class": "checksEdit"
        };

        // Read in a template as a sting
        // debugger;
        helpers.getTemplate("checksEdit", templateData, function(
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
// Dashboard: View all checks
handlers.checksList = function(data, callback) {
    // Reject any request that isn`t a get
    if (data.method === "get") {
        // Prepare data for interpolation
        const templateData = {
            "head.title": "Dashboard",
            "body.class": "checksList"
        };

        // Read in a template as a sting
        // debugger;
        helpers.getTemplate("checksList", templateData, function(
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

// Users handler
handlers.users = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};
handlers._users = require("./controllers/users");

// Tokens handler
handlers.tokens = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};
handlers._tokens = require("./controllers/tokens");

// Checks handler
handlers.checks = function(data, callback) {
    const acceptableMethods = ["post", "put", "get", "delete"];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405);
    }
};
handlers._checks = require("./controllers/checks");

module.exports = handlers;
