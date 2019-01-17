/**
 * HTTP 2 client
 */

const http2 = require("http2");

const client = http2.connect("http://localhost:6000");

const req = client.request({
    ":path": "/"
});

let str = "";

req.on("data", function(chunk) {
    str += chunk;
});

req.on("end", function(chunk) {
    console.log(str);
});

req.end();
