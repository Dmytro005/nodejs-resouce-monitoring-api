const { expect, assert } = require("chai");

const _logs = require("../../lib/common/logs");

module.exports = describe("logs", () => {
    describe(".list", () => {
        it("should return callback, false error and an array of logs", done => {
            _logs.list(false, (err, list) => {
                expect(err).to.be.a("Boolean").false;
                expect(list).to.be.a("Array");
                done();
            });
        });
    });
});