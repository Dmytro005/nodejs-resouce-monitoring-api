/**
 *
 * Server relasted tasks
 *
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const path = require("path");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");

const config = require("./config");
const handlers = require("./handles");
const helpers = require("./helpers");

const util = require("util");
const debug = util.debuglog("server");

// Instantiate server
const server = {};

// Instantiate http server
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});

// Instantiate https server
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem"))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(
    req,
    res
) {
    server.unifiedServer(req, res);
});

// Unified server both for http and for https server
server.unifiedServer = function(req, res) {
    // Parse the url
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    //Get the headers as an object
    const headers = req.headers;

    // Get the payload,if any
    const decoder = new StringDecoder("utf-8");
    let buffer = "";
    req.on("data", function(data) {
        buffer += decoder.write(data);
    });
    req.on("end", function() {
        buffer += decoder.end();

        // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
        let chosenHandler =
            typeof server.router[trimmedPath] !== "undefined"
                ? server.router[trimmedPath]
                : handlers.notFound;

        // Use public route to load static asset
        chosenHandler =
            trimmedPath.indexOf("public/") > -1
                ? handlers.public
                : chosenHandler;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload, contentType) {
            // Use the status code returned from the handler, or set the default status code to 200
            statusCode = typeof statusCode == "number" ? statusCode : 200;

            //Set default content type to JSON
            contentType =
                typeof contentType === "string" ? contentType : "json";

            // Return the response with content specific header
            let payloadString = "";

            if (contentType === "json") {
                res.setHeader("Content-Type", "application/json");
                // Use the payload returned from the handler, or set the default payload to an empty object
                payload = typeof payload == "object" ? payload : {};
                // Convert the payload to a string
                payloadString = JSON.stringify(payload);
            }

            if (contentType === "html") {
                res.setHeader("Content-Type", "text/html");
                payload = typeof payload == "string" ? payload : "";
                payloadString = payload;
            }

            if (contentType === "favicon") {
                res.setHeader("Content-Type", "image/x-icon");
                payload = typeof payload !== "undefined" ? payload : "";
                payloadString = payload;
            }

            if (contentType === "css") {
                res.setHeader("Content-Type", "text/css");
                payload = typeof payload !== "undefined" ? payload : "";
                payloadString = payload;
            }

            if (contentType === "png") {
                res.setHeader("Content-Type", "image/png");
                payload = typeof payload !== "undefined" ? payload : "";
                payloadString = payload;
            }

            if (contentType === "jpg") {
                res.setHeader("Content-Type", "image/jpeg");
                payload = typeof payload !== "undefined" ? payload : "";
                payloadString = payload;
            }

            if (contentType === "plain") {
                res.setHeader("Content-Type", "text/plain");
                payload = typeof payload !== "undefined" ? payload : "";
                payloadString = payload;
            }

            res.writeHead(statusCode);
            res.end(payloadString);

            if (statusCode === 200) {
                debug(
                    "\x1b[32m%s\x1b[0m ",
                    `${method.toUpperCase()} / ${trimmedPath} ${statusCode}`
                );
            } else {
                debug(
                    "\x1b[31m%s\x1b[0m ",
                    `${method.toUpperCase()} / ${trimmedPath} ${statusCode}`
                );
            }
        });
    });
};

// Define the request router
server.router = {
    "": handlers.index,

    "account/create": handlers.accountCreate,
    "account/exist": handlers.accountExist,
    "account/deleted": handlers.accountDeleted,
    "account/edit": handlers.accountEdit,

    "session/create": handlers.sessionCreate,
    "session/deleted": handlers.sessionDeleted,

    "checks/all": handlers.checksList,
    "checks/create": handlers.checksCreate,
    "checks/edit": handlers.checksEdit,

    ping: handlers.ping,
    "api/users": handlers.users,
    "api/tokens": handlers.tokens,
    "api/checks": handlers.checks,

    public: handlers.public
};

server.init = function() {
    // Start the http server
    server.httpServer.listen(config.httpPort, function() {
        console.log(
            "\x1b[36m%s\x1b[0m",
            `The server is up on port ${config.httpPort} and running in ${
                config.envName
            } mode`
        );
    });

    // Start the https server
    server.httpsServer.listen(config.httpsPort, function() {
        console.log(
            "\x1b[35m%s\x1b[0m",
            `The server is up on port ${config.httpsPort} and running in ${
                config.envName
            } mode`
        );
    });
};

module.exports = server;
