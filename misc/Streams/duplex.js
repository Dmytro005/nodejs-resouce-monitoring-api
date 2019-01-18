/**
 *
 * Example implementation of duplex stream
 *
 */
const { Duplex } = require("stream");

const inoutStream = new Duplex({
    write(chunk, encoding, cb) {
        console.log("Written: " + chunk.toString());
        cb();
    },
    read(size) {
        if (this.currentCharCode > 90) {
            this.push(null);
            return;
        }
        if (this.currentCharCode === 65) {
            this.push("Readed: " + String.fromCharCode(this.currentCharCode++));
        }
        this.push(String.fromCharCode(this.currentCharCode++));
    }
});

inoutStream.currentCharCode = 65;
process.stdin.pipe(inoutStream).pipe(process.stdout);
