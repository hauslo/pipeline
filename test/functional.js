/* eslint-env mocha */

const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");
const fsp = require("fs").promises;
const klaw = require("klaw");

const chai = require("chai");
chai.use(require("chai-as-promised"));

const { assert } = chai;

const { BUILD_DIRNAME, GITLAB_CI_FILENAME, PIPELINE_FILENAME } = require("../lib/config.json");
const { init, validate, build } = require("..");

describe("functional tests", () => {
    describe("init", () => {
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test"));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it(`should initialize a new repo with a ${PIPELINE_FILENAME} and ${GITLAB_CI_FILENAME} file`, async () => {
            await init(path.join(__dirname, ".test"));
            await assert.isFulfilled(fsp.stat(path.join(__dirname, ".test", PIPELINE_FILENAME)));
            await assert.isFulfilled(fsp.stat(path.join(__dirname, ".test", GITLAB_CI_FILENAME)));
        });
        it(`should refuse to re-initialize an already initialized repo except if --force is applied`, async () => {
            await assert.isFulfilled(init(path.join(__dirname, ".test"))); // silently do nothing if the configuration exist but is untouched
            await fsp.writeFile(path.join(__dirname, ".test", GITLAB_CI_FILENAME), "# test\n");
            await assert.isRejected(init(path.join(__dirname, ".test")));
            await assert.isFulfilled(init(path.join(__dirname, ".test"), { force: true }));
            await assert.isFulfilled(init(path.join(__dirname, ".test"))); // ensures that the configuration was overridden
        });
    });
    describe("validate", () => {
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test", "uninit"));
            await fse.mkdirp(path.join(__dirname, ".test", "init"));
            await init(path.join(__dirname, ".test", "init"));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it(`should refuse to validate an uninitialized repo and exit with a meaningful error code`, async () => {
            await assert.isRejected(validate(path.join(__dirname, ".test", "uninit")), /initialized/i);
        });
        it(`should validate a repo ${PIPELINE_FILENAME} content`, async () => {
            await assert.isFulfilled(validate(path.join(__dirname, ".test", "init")));
            await fsp.writeFile(path.join(__dirname, ".test", "init", PIPELINE_FILENAME), "# test\n");
            await assert.isRejected(validate(path.join(__dirname, ".test", "init")));
        });
    });
    describe("build", () => {
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test", "build"));
            await init(path.join(__dirname, ".test"));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it(
            `should handle redirecting the output to a custom directory instead of ${BUILD_DIRNAME} (without breaking the rendered configuration relative paths)`
        );
        it(`should be pure`, async () => {
            const hashFile = async file =>
                new Promise((resolve, reject) => {
                    const hash = crypto.createHash("sha256");
                    const stream = fs.createReadStream(file);
                    stream.on("error", err => reject(err));
                    stream.on("data", chunk => hash.update(chunk));
                    stream.on("end", () => resolve(hash.digest("hex")));
                });

            const hashFileTree = async dir => {
                let hash = "";
                // eslint-disable-next-line no-restricted-syntax
                for await (const file of klaw(dir)) {
                    hash += path.relative(dir, file.path);
                    if (file.stats.isFile()) {
                        hash += await hashFile(file.path);
                    }
                }
                return hash;
            };

            await build(path.join(__dirname, ".test"), { output: path.join(__dirname, ".test", "build") });
            const hash1 = await hashFileTree(path.join(__dirname, ".test", "build"));

            await fse.remove(path.join(__dirname, ".test", "build"));

            await build(path.join(__dirname, ".test"), { output: path.join(__dirname, ".test", "build") });
            const hash2 = await hashFileTree(path.join(__dirname, ".test", "build"));

            assert.equal(hash1, hash2);
        });
        it(`should refuse to build if the build directory is not ${BUILD_DIRNAME} and is not empty`, async () => {
            await assert.isRejected(
                build(path.join(__dirname, ".test"), { output: path.join(__dirname, ".test", "build") }),
                /not empty/
            );
        });
        it(`should clean all remnants of previous builds from the build directory if it is ${BUILD_DIRNAME}`, async () => {
            await fse.mkdirp(path.join(__dirname, ".test", BUILD_DIRNAME));
            await fsp.writeFile(path.join(__dirname, ".test", BUILD_DIRNAME, "test"), "# test\n");
            await build(path.join(__dirname, ".test"));
            await assert.isRejected(fsp.stat(path.join(__dirname, ".test", BUILD_DIRNAME, "test")), /ENOENT/);
        });
    });
});
