/**
 * Helpers for various tasks
 *
 */
const crypto = require("crypto");
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

module.exports = helpers;
