/**
 * HTTP 2 Server
 *
 */

const http2 = require("http2");

const server = http2.createServer();

server.on("stream", function(stream, header) {
    stream.respond({
        status: 200,
        "content-tyep": "text/html"
    });
    stream.end("<html><body><p>HTTP2</p></body></html>");
});

server.listen(6000);
