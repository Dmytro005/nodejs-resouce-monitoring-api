/**
 *
 * Library for storing the rotating logs
 *
 */

const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

// Container for the module
const lib = {};

lib.baseDir = path.join(__dirname, "/../.logs/");

// Append a file to a string. Create a file it dosen`t exist
lib.append = function(file, str, callback) {
    fs.open(lib.baseDir + "/" + file + ".log", "a", function(
        error,
        fileDescriptor
    ) {
        if (!error && fileDescriptor) {
            // Write to file and close it
            fs.writeFile(fileDescriptor, str, function(err) {
                fs.appendFile(fileDescriptor, str + "\n", function(err) {
                    if (!err) {
                        fs.close(fileDescriptor, function(err) {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Could not close file after appeding");
                            }
                        });
                    } else {
                        callback("Could not append to file");
                    }
                });
            });
        } else {
            callback("Error could not open file to appending");
        }
    });
};

module.exports = lib;
