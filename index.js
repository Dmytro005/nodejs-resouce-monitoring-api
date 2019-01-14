/**
 * Primary file for the API
 * 
 * 
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers/');
const cli = require('./lib/cli');

const app = {};

app.init = function (callback) {
    // Start server
    server.init();

    // Start workers
    workers.init();

    // Start the cli
    setTimeout(function(){
        cli.init();
        callback()
    }, 100)
}

// Self invoking   only if requiring directly
// If it is the main module that starts the app
if(require.main === module) {
    app.init(function(){}); 
}

module.exports = app;