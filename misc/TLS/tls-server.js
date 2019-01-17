/**
 *
 * Example TCP server
 *
 */

const tls = require("tls");
const fs = require("fs");
const path = require("path");

const options = {
    key: fs.readFileSync(path.join(__dirname, "/../../https/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "/../../https/cert.pem"))
};

const server = tls.createServer(options, connection => {
    // Send the word pong to every connection(client)
    const outboundMessage = "PONG";
    connection.write(outboundMessage);

    // Receive data fro a client
    connection.on("data", function(inboundMessageBuffer) {
        const inboundMessageStr = inboundMessageBuffer.toString();
        console.log(`Received ${inboundMessageStr}, sent ${outboundMessage}`);
    });
});

server.listen("6000", function() {
    console.log("TLS server started");
});
