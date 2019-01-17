/**
 *
 * Example TLS server
 *
 */

const net = require("tls");

const server = net.createServer(connection => {
    // Send the word pong to every connection(client)
    console.log("TCP server started");

    const outboundMessage = "PONG";
    connection.write(outboundMessage);

    // Receive data fro a client
    connection.on("data", function(inboundMessageBuffer) {
        const inboundMessageStr = inboundMessageBuffer.toString();
        console.log(`Received ${inboundMessageStr}, sent ${outboundMessage}`);
    });
});

server.listen("6000");
