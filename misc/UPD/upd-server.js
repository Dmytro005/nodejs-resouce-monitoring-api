/***
 *
 * UDP server
 *
 */

const dgram = require("dgram");

// Create a server
const server = dgram.createSocket("udp4");

server.on("message", function(messageBuffer, sender) {
    // Process incoming message or with sender
    const messageStr = messageBuffer.toString();
    console.log(messageStr);
});

server.bind("6000", "localhost", function() {
    console.log("UPD server started");
});
