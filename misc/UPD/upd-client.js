/**
 *
 * UDP client
 *
 */

const dgram = require("dgram");

const client = dgram.createSocket("udp4");

// Create a message
const messageStr = "Message from client";
const messageBuffer = Buffer.from(messageStr);

// Send message
client.send(messageBuffer, 6000, "localhost", function(err) {
    console.log("UPD client started");
    client.close();
    console.log("UPD client closed connection");
});
