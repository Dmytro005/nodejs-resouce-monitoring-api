const helpers = require("../helpers");

const Responder = {
    // Help / Man
    help: function() {
        const commands = helpers.readObjectFromJSON(
            __dirname + "/commands_desc.json"
        );

        // Show a header for the help page that is as wide as the screen
        this.horizontalLine();
        this.centered("CLI MANUAL");
        this.horizontalLine();
        this.verticalSpace();

        // Show each command followed by it`s explanatioan in whute and yelow
        for (let key in commands) {
            if (commands.hasOwnProperty(key)) {
                const value = commands[key];
                let line = `\x1b[33m ${key} \x1b[0m`;
                const padding = 60 - line.length;
                for (let i = 0; i < padding; i++) {
                    line += " ";
                }
                line += value;
                console.log(line);
                this.verticalSpace();
            }
        }

        this.verticalSpace(1);
        this.horizontalLine();
    },
    // Exit
    exit: function() {
        process.exit(0);
    },
    // Stats
    stats: function() {
        console.log("You asked for stats");
    },
    // List Users
    listUsers: function() {
        console.log("You asked to list users");
    },
    // More user info
    moreUserInfo: function(str) {
        console.log("You asked for more user info", str);
    },
    // List Checks
    listChecks: function() {
        console.log("You asked to list checks");
    },
    // More check info
    moreCheckInfo: function(str) {
        console.log("You asked for more check info", str);
    },

    /**
     * Some helpers function fo drawing text and lines
     */

    // List Logs
    listLogs: function() {
        console.log("You asked to list logs");
    },
    // More logs info
    moreLogInfo: function(str) {
        console.log("You asked for more log info", str);
    },

    // Create a horizontal line across the screen
    horizontalLine: function() {
        const width = process.stdout.columns;
        let line = "";
        for (let i = 0; i < width; i++) {
            line += "-";
        }
        console.log(line);
    },

    // Center text on the screen;
    centered: function(str) {
        str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";
        const width = process.stdout.columns;

        // Calculate the left padding that should be
        const leftPadding = Math.floor((width - str.length) / 2);

        // Put left the left padded string before the line itself
        let line = "";
        for (let i = 0; i < leftPadding; i++) {
            line += " ";
        }
        line += str;

        console.log(line);
    },

    // Create a vertical space
    verticalSpace: function(lines) {
        lines = typeof lines == "number" && lines > 0 ? lines : 1;
        for (let i = 0; i < lines; i++) {
            console.log("");
        }
    }
};

module.exports = Responder;
