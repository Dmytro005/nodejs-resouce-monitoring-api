/**
 *
 * Example TCP client
 *
 */

const tls = require("tls");
const fs = require("fs");
const path = require("path");

// Required only because we use ssl are connecting to tls network
const options = {
    ca: fs.readFileSync(path.join(__dirname, "/../../https/cert.pem"))
};

const outboundMessage = "PING";

// Create a client connection
const client = tls.connect(
    6000,
    options,
    function() {
        console.log("TLS client connected to socket");
        // Send message to the server
        client.write(outboundMessage);
    }
);

// When server respond with some message log it out
client.on("data", function(inboundMessageBuffer) {
    const inboundMessageStr = inboundMessageBuffer.toString();
    console.log(`Received ${inboundMessageStr}, sent ${outboundMessage}`);
});
