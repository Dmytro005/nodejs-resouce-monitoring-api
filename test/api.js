/**
 *
 * API tests
 *
 */

const app = require("./../index");
const assert = require("assert");
const http = require("http");
const config = require("../lib/config");

// Helpers
const helpers = {};
helpers.makeGetRequest = function(path, callback) {
    // Configure the request details
    const requestDetails = {
        protocol: "http:",
        hostname: "localhost",
        port: config.httpPort,
        method: "GET",
        path: path,
        headers: {
            "Content-Type": "application/json"
        }
    };

    // Send the request
    const req = http.request(requestDetails, function(res) {
        callback(res);
    });

    req.end();
};

const api = {
    // Check if the app is start up withput an errro
    ["app.init should start without throwing"]: function(done) {
        assert.doesNotThrow(function() {
            app.init(() => {
                done();
            });
        }, TypeError);
    },

    // Make request to /ping
    ["/ping should respond to GET with 200 "]: function(done) {
        helpers.makeGetRequest("/ping", response => {
            assert.equal(response.statusCode, 200);
            done();
        });
    },

    // Make request to /api/users
    ["/api/users should respond to GET with 400 "]: function(done) {
        helpers.makeGetRequest("/api/users", response => {
            assert.equal(response.statusCode, 400);
            done();
        });
    },

    // Make a request to random path
    ["/random should respond to GET with 404 "]: function(done) {
        helpers.makeGetRequest("/random", response => {
            assert.equal(response.statusCode, 404);
            done();
        });
    },

    // Make a request to /example/error path
    ["/example/error should respond to GET with 500 "]: function(done) {
        helpers.makeGetRequest("/example/error", function(response) {
            assert.equal(response.statusCode, 500);
            done();
        });
    }
};

module.exports = api;
