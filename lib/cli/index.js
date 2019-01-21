/**
 * CLI related tasks
 *
 */

const readline = require("readline");
const util = require("util");
const debug = util.debuglog("cli");
const events = require("events");

const Responder = require("./responders");
const helpers = require("../common/helpers");

class _events extends events {}

const e = new _events();

// Instatiate a cli object

const cli = {};

// Input handlers
e.on("man", function(str) {
    cli.responders.help();
});

e.on("help", function(str) {
    cli.responders.help();
});

e.on("exit", function(str) {
    cli.responders.exit();
});

e.on("stats", function(str) {
    cli.responders.stats();
});

e.on("list users", function(str) {
    cli.responders.listUsers();
});

e.on("more user info", function(str) {
    cli.responders.moreUserInfo(str);
});

e.on("list checks", function(str) {
    cli.responders.listChecks(str);
});

e.on("more check info", function(str) {
    cli.responders.moreCheckInfo(str);
});

e.on("list logs", function(str) {
    cli.responders.listLogs(str);
});

e.on("more log info", function(str) {
    cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = Responder;

// input processor
cli.processInput = function(str) {
    str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        // Add some unique strings so that we can match it
        const { commands: uniqueStrings } = require("./commands.json");

        let matchFound = false;
        let counter = 0;

        uniqueStrings.some(function(input) {
            if (str.toLocaleLowerCase().indexOf(input) > -1) {
                matchFound = true;
                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            console.log("Sorry, try again");
        }
    }
};

cli.init = function() {
    console.log(
        "\x1b[34m%s\x1b[0m ",
        `The cli is running, run 'help' for seeing docs and 'exit' to stop the app`
    );

    const _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ""
    });

    // Create an initial prompt
    _interface.prompt();

    //Handle each kine of interface separately
    _interface.on("line", function(str) {
        // Send to input processor
        cli.processInput(str);

        _interface.prompt();
    });

    // Handle cli closing
    _interface.on("close", function() {
        process.exit(0);
    });
};

module.exports = cli;
