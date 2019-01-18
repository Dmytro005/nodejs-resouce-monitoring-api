/**
 *
 * Zipping script example using streams
 *
 * Usage:
 *  - node zip.js test.txt
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
    .pipe(zlib.createGzip())
    .pipe(progress)

    // Use for ordinary zipping
    // .pipe(fs.createWriteStream(file+'.gz'))

    // Use for zipping with ciphering
    .pipe(crypto.createCipher("aes192", "myLovelySecret"))
    .pipe(fs.createWriteStream(file + ".cgz"))
    .on("finish", () => {
        console.log("Ciphered and Zipped");
    })

    .on("finish", () => {
        console.log("Zipped");
    });
