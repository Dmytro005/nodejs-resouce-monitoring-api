/**
 * Helpers for various tasks
 *
 */
const crypto = require("crypto");
const queryString = require("querystring");
const https = require("https");
const StringDecoder = require("string_decoder").StringDecoder;

const path = require("path");
const fs = require("fs");

const config = require("./config");

const helpers = {};

// Create SHA 256 hash
helpers.hash = function(str) {
    if (typeof str == "string" && str.length > 0) {
        const hash = crypto
            .createHmac("sha256", config.hashSecret)
            .update(str)
            .digest("hex");

        return hash;
    } else {
        return false;
    }
};

// Parse a json string to an object, without throwing
helpers.parseJsonToObject = function(str) {
    try {
        const object = JSON.parse(str);
        return object;
    } catch (error) {
        return {};
    }
};

// Create a string of random alpha-numeric charaters of given length
helpers.createRamdomString = function(strLength) {
    strLength =
        typeof strLength === "number" && strLength > 0 ? strLength : false;
    if (strLength) {
        // define all the posible chracters that could go to the string
        const possibleCharacters = "qwertyuiopasdfghjklzxcvbnm1234567890";

        let str = "";

        for (let i = 1; i <= strLength; i++) {
            const randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            str += randomCharacter;
        }

        return str;
    } else {
        return false;
    }
};

helpers.sendTwilioSMS = function(phone, message, callback) {
    // Validate params

    phone =
        typeof phone === "string" && phone.trim().length === 10
            ? phone.trim()
            : false;
    message =
        typeof message === "string" &&
        message.trim().length > 0 &&
        message.trim().length < 1600
            ? message.trim()
            : false;

    if (phone && message) {
        // Configure the request payload
        const payload = {
            From: config.twilio.fromPhone,
            To: "+38" + phone + "",
            Body: message
        };

        const stringPayload = queryString.stringify(payload);

        // Configure request details
        const requestDetails = {
            protocol: "https:",
            hostname: "api.twilio.com",
            method: "POST",
            path:
                "/2010-04-01/Accounts/" +
                config.twilio.accountSId +
                "/Messages.json",
            auth: config.twilio.accountSId + ":" + config.twilio.authToken,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(stringPayload)
            }
        };

        //Instantiate a req object
        const req = https.request(requestDetails, function(res) {
            //
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                const decoder = new StringDecoder("utf-8");
                let response = "";
                res.on("data", function(data) {
                    response += decoder.write(data);
                });
                res.on("end", function() {
                    response += decoder.end();
                    console.log(response);
                    callback(
                        "Twilio responded with " + status + " status code"
                    );
                });
            }
        });

        // Handle error
        req.on("error", function(e) {
            callback(e);
        });

        // Add the paylaod
        req.write(stringPayload);

        //Send request
        req.end();
    } else {
        callback("Given parameters were missing or invalid");
    }
};

// Get sting content from a template
helpers.getTemplate = function(templateName, data, callback) {
    templateName =
        typeof templateName == "string" && templateName.length > 0
            ? templateName
            : false;

    data = typeof data == "object" && data !== null ? data : {};

    if (templateName) {
        const templatesDir = path.join(__dirname, "/../templates/");
        fs.readFile(templatesDir + templateName + ".html", "utf-8", function(
            err,
            str
        ) {
            if (!err && str && str.length > 0) {
                const finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback("No template could be found");
            }
        });
    } else {
        callback("Invalid template name");
    }
};

// Add the univarsal header and footer and pass provided
// data object to the header and footer fot interpolation
helpers.addUniversalTemplates = function(str, data, callback) {
    str = typeof str == "string" && str.length > 0 ? str : "";
    data = typeof data == "object" && data !== null ? data : {};
    // Header
    helpers.getTemplate("_header", data, function(err, headerString) {
        if (!err && headerString) {
            // Footer
            helpers.getTemplate("_footer", data, function(err, footerString) {
                if (!err && footerString) {
                    // Add all the string
                    const fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback("Could not find the footer template");
                }
            });
        } else {
            callback("Could not find the header template");
        }
    });
};

// Take a given string and a data object and find and replace all the keys within it
helpers.interpolate = function(str, data) {
    str = typeof str == "string" && str.length > 0 ? str : "";
    data = typeof data == "object" && data !== null ? data : {};

    // Add templateGlobals to the data object, prepending their keys with 'global' name
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data["global." + keyName] = config.templateGlobals[keyName];
        }
    }

    // For each key into data insert their value into the string at the correcsponding placeholder
    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === "string") {
            const replace = data[key];
            const find = "{" + key + "}";
            str = str.replace(find, replace);
        }
    }
    // debugger;
    return str;
};

helpers.readStaticAsset = function(fileName, callback) {
    fileName =
        typeof fileName == "string" && fileName.length > 0 ? fileName : false;

    if (fileName) {
        const publicDir = path.join(__dirname, "/../public/");
        fs.readFile(publicDir + fileName, function(err, data) {
            if (!err && data) {
                callback(false, data);
            } else {
                callback("No file could be found");
            }
        });
    } else {
        callback("The valid file name must be specified");
    }
};

module.exports = helpers;
