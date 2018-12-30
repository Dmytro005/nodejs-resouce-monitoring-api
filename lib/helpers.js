/**
 * Helpers for various tasks
 * 
 */
const crypto = require('crypto');
const config = require('./config');

const helpers = {} 

 // Create SHA 256 hash
helpers.hash = function(str) {
   if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto
        .createHmac('sha256', config.hashSecret)
        .update(str)
        .digest('hex');

        return hash;
   } else {
       return false;
   }
}


//Parse a json string to an object, without throwing
helpers.parseJsonToObject = function(str) {
    try {
        const object = JSON.parse(str);
        return object;
    } catch (error) {
        return {};
    }
}

 module.exports = helpers;