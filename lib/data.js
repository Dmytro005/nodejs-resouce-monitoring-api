/**
 * Library for storing and writing data
 *
 */

const fs = require("fs");
const path = require("path");

const helpers = require('./helpers');

// Conctainer for the  module

const lib = {};

// Base directory for the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = function(dir, file, data, callback) {
    // Open the file to writting
    fs.open(lib.baseDir + dir + "/" + file + ".json", "wx", function(
        error,
        fileDescriptor
    ) {
        if (!error && fileDescriptor) {
            // Conver data to a string
            const stringData = JSON.stringify(data);
            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback("Error closing file");
                        }
                    });
                } else {
                    callback("Error writing a new file");
                }
            });
        } else {
            callback("Could not create new file, it may already exist");
        }
    });
};

// Read data from the file
lib.read = function(dir, file, callback) {
    fs.readFile(lib.baseDir + dir + "/" + file + ".json", "utf-8", function(
        err,
        data
    ) {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err);
        }
    });
};

// Update data in the file
lib.update = function(dir, file, data, callback) {
    fs.open(lib.baseDir + dir + "/" + file + ".json", "r+", function(
        error,
        fileDescriptor
    ) {
        if (!error && fileDescriptor) {
            // Conver data to a string
            const stringData = JSON.stringify(data);
            fs.truncate(fileDescriptor, function(err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback("Error closing file");
                                }
                            });
                        } else {
                            callback("Error writing to existing file");
                        }
                    });
                } else {
                    callback("Error truncating file");
                }
            });
        } else {
            callback("Could not open file, it may not exist yet");
        }
    });
};

// Delete file
lib.delete = function(dir, file, callback) {
    fs.unlink(lib.baseDir + dir + "/" + file + ".json", function(err) {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting the file');
        }
    })
}

module.exports = lib;
