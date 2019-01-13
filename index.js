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

app.init = function () {
    // Start server
    server.init();

    // Start workers
    workers.init();

    // Start the cli
    setTimeout(function(){
        cli.init();
    }, 100)
}

app.init()

module.exports = app;