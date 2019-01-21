const fs = require("fs");

function fileSize(fileName, cb) {
    if (typeof fileName !== "string") {
        return process.nextTick(
            cb,
            new TypeError("FileName should be a string lol")
        );
    }

    fs.stat(fileName, (err, { size }) => {
        if (!err) {
            cb(null, size);
        } else {
            cb("err");
        }
    });
}

fileSize(__filename, (err, size) => {
    console.log("Async cb, size: ", size);
});

console.log("Sync hello!");
