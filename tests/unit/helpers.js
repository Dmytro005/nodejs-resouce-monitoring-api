const rewire = require("rewire");

const sinon = require("sinon");
const PassThrough = require("stream").PassThrough;
const http = require("http");

const { expect } = require("chai");

const helpers = require("../../lib/common/helpers");

module.exports = describe("helpers", () => {
    describe(".hash", () => {
        it("should return hashed string", () => {
            let hash = helpers.hash("someString");
            expect(hash).to.be.a("String");
        });

        it("should return false if the given paramenter isn`t a string", () => {
            let hash = helpers.hash({});
            expect(hash).to.be.a("Boolean").false;
        });

        it("should return false if the given paramenter is empty string", () => {
            let hash = helpers.hash("");
            expect(hash).to.be.a("Boolean").false;
        });
    });

    describe(".getTemplate", (tempalate, data) => {
        const helpers = rewire("../../lib/common/helpers");

        it("should return template", done => {
            const readFileAsync = async (path, encoding) =>
                Promise.resolve("Some template");

            helpers.__set__("readFileAsync", readFileAsync);

            helpers.getTemplate(
                "./dasd./asdsd",
                { key: "value" },
                (err, str) => {
                    expect(err).to.be.a("Boolean").false;
                    expect(str).to.be.a("String");
                    done();
                }
            );
        });


        // Realization with a callback
        it.skip("should return template with interpolated values", done => {

            const fsMock = {
                readFile: function(path, encoding, cb) {
                    cb(null, "some {interpolated} data");
                }
            };

            helpers.__set__("fs", fsMock);

            helpers.getTemplate(
                "./dasd./asdsd",
                { interpolated: "nice" },
                (err, str) => {
                    expect(err).to.be.a("Boolean").false;
                    expect(str)
                        .to.be.a("String")
                        .to.match(/nice/);
                    done();
                }
            );
        });

        it("should return string with error if template does not exist", done => {

            const readFileAsync = async (path, encoding) =>
                Promise.reject();

            helpers.__set__("readFileAsync", readFileAsync);

            helpers.getTemplate("./dasd./asdsd", {}, (err, str) => {
                expect(err).to.be.a('String').match(/No template could be found/);
                expect(str).to.be.a('Undefined');
                done();
            });
        });
    });
});
