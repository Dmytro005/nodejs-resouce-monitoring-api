/**
 *
 * Example implementation of readable stream
 *
 */

const { Readable } = require("stream");

// const inStream = new Readable();

// inStream.push('SOME DATA PUSHED IN READABLE STREAM');
// inStream.push(null);

// inStream.pipe(process.stdout);

const inStream = new Readable({
    read(size) {
        setTimeout(() => {
            if (this.currentCharCode > 90) {
                this.push(null);
                return;
            }
            this.push(String.fromCharCode(this.currentCharCode++));
        }, 5);
    }
});

inStream.currentCharCode = 65;

inStream.pipe(process.stdout);

process.on("exit", () => {
    console.log(` \n \n current char code is: ${inStream.currentCharCode}`);
});

process.stdout.on("error", process.exit);
