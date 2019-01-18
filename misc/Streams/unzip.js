/**
 *
 * Unzipping script example using streams
 * Usage:
 *  - node unzip.js test.txt.cgz
 */

const fs = require("fs");
const zlib = require("zlib");
const crypto = require("crypto");
const file = process.argv[2];

const { Transform } = require("stream");

const progress = new Transform({
    transform(chunk, encoding, cb) {
        process.stdout.write(".");
        cb(null, chunk);
    }
});

fs.createReadStream(file)
    .pipe(crypto.createDecipher("aes192", "myLovelySecret"))
    .pipe(zlib.createGunzip())
    .pipe(progress)
    .pipe(fs.createWriteStream(file.slice(0, -4)))
    .on("finish", () => {
        console.log("Unziped ciphered file!");
    });
