/* eslint-env mocha */

const path = require("path");
const fse = require("fs-extra");
const fsp = require("fs").promises;

const chai = require("chai");
chai.use(require("chai-as-promised"));

const { assert } = chai;

const init = require("../lib/init");

describe("lib/init", () => {
    before("setup test directory", async () => {
        await fse.mkdirp(path.join(__dirname, ".test"));
    });
    after("cleanup test directory", async () => {
        await fse.remove(path.join(__dirname, ".test"));
    });
    it("should init if the repo is not initialized", async () => {
        await assert.isFulfilled(init(path.join(__dirname, ".test")));
    });
    it("should skip if the repo is already initialized", async () => {
        await assert.isFulfilled(init(path.join(__dirname, ".test")));
    });
    it("should fail if the repo is already initialized and modified and no --force", async () => {
        await fsp.writeFile(path.join(__dirname, ".test", ".pipeline.yml"), "# test\n");
        await assert.isRejected(init(path.join(__dirname, ".test")));
    });
    it("should override if the repo is already initialized and modified and --force", async () => {
        await assert.isFulfilled(init(path.join(__dirname, ".test"), { force: true }));
    });
});
