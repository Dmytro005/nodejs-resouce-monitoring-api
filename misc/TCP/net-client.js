/**
 *
 * Example TCP client
 *
 */

const net = require("net");

const outboundMessage = "PING";

// Create a client connection
const client = net.createConnection({ port: 6000 }, function() {
    console.log("TCP client connected to socket");
    // Send message to the server
    client.write(outboundMessage);
});

// When server respond with some message log it out
client.on("data", function(inboundMessageBuffer) {
    const inboundMessageStr = inboundMessageBuffer.toString();
    console.log(`Received ${inboundMessageStr}, sent ${outboundMessage}`);
});
