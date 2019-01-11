/**
 * CLI related tasks
 *
 */

const readline = require("readline");
const util = require("util");
const debug = util.debuglog("cli");
const events = require("events");

class _events extends events {}

const e = new _events();

// Instatiate a cli object

const cli = {};

cli.init = function() {
    console.log("\x1b[34m%s\x1b[0m ", `The cli is running`);

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

cli.processInput = function(str) {
    str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        // Add some unique strings so that we can match it
        const uniqueStrings = [
            "man",
            "help",
            "exit",
            "stats",
            "list users",
            "more user info",
            "list checks",
            "more check info",
            "list logs",
            "more log info"
        ];

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

module.exports = cli;
