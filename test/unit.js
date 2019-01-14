const assert = require("assert");

const helpers = require("../lib/common/helpers");
const _logs = require("../lib/common/logs");

const UnitTests = {
    // Assert that some function will return a number
    ["helpers.getANumber should return a number"]: function(done) {
        const value = helpers.getANumber();
        assert.equal(typeof value, "number");
        done();
    },

    // Assert that some function will return some value
    ["helpers.getANumber should return 1"]: function(done) {
        const value = helpers.getANumber();
        assert.equal(value, 1);
        done();
    },

    // Assert that some function will return some value
    ["helpers.getANumber should return 2"]: function(done) {
        const value = helpers.getANumber();
        assert.equal(value, 2);
        done();
    },

    ["logs.list should return callback, false error and an array of logs "]: function(
        done
    ) {
        _logs.list(true, function(err, logFileNames) {
            assert.equal(err, false);
            assert.ok(logFileNames instanceof Array);
            assert.ok(logFileNames.length > 1);
            done();
        });
    },

    // logs.truncate should not throw if the id is not exists
    ["logs.truncate returns a callback if the id of the log does not exist"]: function(
        done
    ) {
        assert.doesNotThrow(function() {
            _logs.truncate("IdoNotExsist", function(err) {
                assert.ok(err);
                done();
            });
        }, TypeError);
    }
};

module.exports = UnitTests;
