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

// List all the logs and optionally include compressed logs
lib.list = function(includeCompressedLogs, callback) {
    fs.readdir(lib.baseDir, function(err, data) {
        if (!err && data && data.length > 0) {
            const trimedFileNames = data.reduce(function(acc, fileName) {
                if (fileName.indexOf(".log") > -1) {
                    acc.push(fileName.replace(".log", ""));
                }

                if (fileName.indexOf(".gz.b64") > -1 && includeCompressedLogs) {
                    acc.push(fileName.replace(".gz.b64", ""));
                }

                return acc;
            }, []);
            callback(false, trimedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// Compress a content of one .log file into .gz.b64 filw withting the same directory
lib.compress = function(logId, newFileId, callback) {
    const sourceFile = logId + ".log";
    const destFile = newFileId + ".gz.b64";

    // Read the sourcefile
    fs.readFile(lib.baseDir + sourceFile, "utf-8", function(err, inputString) {
        if (!err && inputString) {
            // Compress the data using gzip
            zlib.gzip(inputString, function(err, buffer) {
                if (!err && buffer) {
                    // Send ht data to the destination file
                    fs.open(lib.baseDir + destFile, "wx", function(
                        err,
                        fileDescriptor
                    ) {
                        if (!err && fileDescriptor) {
                            fs.writeFile(
                                fileDescriptor,
                                buffer.toString("base64"),
                                function(err) {
                                    if (!err) {
                                        fs.close(fileDescriptor, function(err) {
                                            if (!err) {
                                                callback(false);
                                            } else {
                                                callback(err);
                                            }
                                        });
                                    } else {
                                        callback(err);
                                    }
                                }
                            );
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// Decompress file to string var
lib.decompress = function(fileId, callback) {
    const fileName = fileId + ".gz.b64";
    fs.readFile(baseDir + fileName, "utf-8", function(err, str) {
        if (!err) {
            // Create a buffer with base 64 string
            const inputBuffer = Buffer.from(str, "base64");
            zlib.unzip(inputBuffer, function(err, outputBuffer) {
                if (!err && outputBuffer) {
                    const str = outputBuffer.toString("base64");
                    callback(false, str);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

// Truncate a log file
lib.truncate = function(fileId, callback) {
    fs.truncate(lib.baseDir + fileId + ".log", function(err) {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = lib;
