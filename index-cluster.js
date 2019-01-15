/**
 * Primary file for the API
 * 
 * 
 */

// Dependencies

const cluster = require('cluster');
const os = require('os');

const server = require('./lib/server');
const workers = require('./lib/workers/');
const cli = require('./lib/cli');

const app = {};

app.init = function (callback) {

    if(cluster.isMaster) {
        // If we`re in the master thread start workers and cli
        // Start workers
        workers.init();
    
        // Start the cli
        setTimeout(function(){
            cli.init();
            callback()
        }, 100)

        // Fork this process

        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }

    } else {
        // If we`re not in the master thread start server
        // Start server
        server.init();

    }

}

// Self invoking   only if requiring directly
// If it is the main module that starts the app
if(require.main === module) {
    app.init(function(){}); 
}

module.exports = app;