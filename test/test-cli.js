/* eslint-env mocha */

const chai = require("chai");
chai.use(require("chai-as-promised"));

const { assert } = chai;

const cli = require("../lib/cli");

describe("lib/cli", () => {
    it("should return an empty object on unrecognized commands", () => {
        assert.deepEqual({}, cli(["a"]));
    });
    it("should return an empty object when missing a command", () => {
        assert.deepEqual({}, cli([]));
    });
    it("should return an empty object more than one command is passed", () => {
        assert.deepEqual({}, cli(["a", "b"]));
    });
    it("should return the command name as .cmd", () => {
        assert.equal("build", cli(["build"]).cmd);
    });
    it("should return an options object as .options", () => {
        assert.deepEqual(
            {
                merge: false,
                output: undefined
            },
            cli(["build"]).options
        );
    });
    it("should return the repository path as .repo if specified", () => {
        assert.deepEqual(".", cli(["build", "."]).repo);
    });
});
