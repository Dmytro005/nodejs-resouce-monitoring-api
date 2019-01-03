/**
 * Helpers for various tasks
 *
 */
const crypto = require("crypto");
const queryString = require("querystring")
const https = require("https");
const StringDecoder = require("string_decoder").StringDecoder;

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

    if(phone && message) {
        // Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+38'+phone+'',
            'Body': message
        }

        const stringPayload = queryString.stringify(payload);

        // Configure request details
        const requestDetails = {
            'protocol' : 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+config.twilio.accountSId+'/Messages.json',
            'auth': config.twilio.accountSId+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
            }
        }

        //Instantiate a req object
        const req = https.request(requestDetails, function(res) {
            //
            const status = res.statusCode
            if(status === 200 || status === 201) {
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
                    callback('Twilio responded with '+status+' status code');
                })
            }
        })

        // Handle error
        req.on('error', function(e){
            callback(e);
        })

        // Add the paylaod
        req.write(stringPayload);

        //Send request
        req.end(); 

    } else {
        callback('Given parameters were missing or invalid')
    }
};

module.exports = helpers;
