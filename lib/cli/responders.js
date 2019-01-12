const os = require("os");
const v8 = require("v8");

const helpers = require("../helpers");
const _data = require("../data");

const Responders = {
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
        const stats = {
            "Load Avarage": os.loadavg().join(" "),
            "CPU Count": os.cpus().length,
            "Free Memory": os.freemem(),
            "Current Melloced Memory": v8.getHeapStatistics().malloced_memory,
            "Peak Melloced Memory": v8.getHeapStatistics().peak_malloced_memory,
            "Allocated Heap Used (%)": Math.round(
                (v8.getHeapStatistics().used_heap_size /
                    v8.getHeapStatistics().total_heap_size) *
                    100
            ),
            "Available Heap Allocated (%)": Math.round(
                (v8.getHeapStatistics().total_heap_size /
                    v8.getHeapStatistics().heap_size_limit) *
                    100
            ),
            "Uptime ": os.uptime() + " seconds"
        };

        // Create a header for the stats
        this.horizontalLine();
        this.centered("SYSTEM STATISTICS");
        this.horizontalLine();
        this.verticalSpace();

        for (let key in stats) {
            if (stats.hasOwnProperty(key)) {
                const value = stats[key];
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
    // List Users
    listUsers: function() {
        _data.list("users", (err, usersIds) => {
            if (!err && usersIds && usersIds.length > 0) {
                this.verticalSpace();
                usersIds.forEach(userId => {
                    _data.read("users", userId, (err, userData) => {
                        if (!err && userData) {
                            const {
                                firstName,
                                lastName,
                                phone,
                                checks
                            } = userData;

                            const checksNumber =
                                typeof checks === "object" &&
                                checks instanceof Array
                                    ? checks.length
                                    : 0;

                            let line = `User: ${firstName} ${lastName} Phone: ${phone} Checks: ${checksNumber}`;

                            console.log(line);
                            this.verticalSpace();
                        }
                    });
                });
            }
        });
    },
    // More user info
    moreUserInfo: function(str) {
        // Get the user id
        const arr = str.split('--')
        const userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
        if (userId) {
            _data.read('users', userId, (err, userData) => {
                if(!err && userData) {
                    // Remove hashed password before displaying the user  
                    delete userData.hashedPassword;
                    // Print highlited JSON
                    this.verticalSpace();
                    console.dir(userData, {colors: true});
                    this.verticalSpace();
                }
            })
        }
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

module.exports = Responders;
