/* eslint-env mocha */

const chai = require("chai");
chai.use(require("chai-as-promised"));

const { assert } = chai;

const path = require("path");
const fse = require("fs-extra");
const fsp = require("fs").promises;

const gitlabCiLint = require("gitlab-ci-lint");

const { BUILD_DIRNAME, GITLAB_CI_FILENAME } = require("../lib/config.json");

const { makeId, makeDomain, makeSlug } = require("../lib/build/makeId");
const renderTf = require("../lib/build/renderTf")({ BUILD_DIRNAME });
const renderGitlabCi = require("../lib/build/renderGitlabCi")({ BUILD_DIRNAME, GITLAB_CI_FILENAME });
const createBuildDirectory = require("../lib/build/createBuildDirectory")({
    BUILD_DIRNAME
});

describe("lib/build", () => {
    describe("renderGitlabCi()", () => {
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test"));
            await fse.mkdirp(path.join(__dirname, ".test", BUILD_DIRNAME));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it("should not throw", async () => {
            await assert.isFulfilled(
                renderGitlabCi(
                    path.join(__dirname, ".test"),
                    {},
                    { includes: [], paths: { build: BUILD_DIRNAME, _build: ".." } }
                )
            );
        });
        it(`should have created a ${GITLAB_CI_FILENAME} file`, async () => {
            await assert.isFulfilled(fsp.stat(path.join(__dirname, ".test", BUILD_DIRNAME, GITLAB_CI_FILENAME)));
        });
        it(`the built ${GITLAB_CI_FILENAME} should validate against the Gitlab CI Linter https://docs.gitlab.com/ee/api/lint.html`, async () => {
            await assert.isFulfilled(
                gitlabCiLint.lintFile(path.join(__dirname, ".test", BUILD_DIRNAME, GITLAB_CI_FILENAME))
            );
        });
    });

    describe("renderTf()", () => {
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test"));
            await fse.mkdirp(path.join(__dirname, ".test", BUILD_DIRNAME));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it("should not throw", async () => {
            await assert.isFulfilled(renderTf(path.join(__dirname, ".test")));
        });
        it("should have copied the shared infra configuration", async () => {
            const expected = await fsp.readdir(path.resolve(__dirname, "..", "lib", "build", "infra"));
            const actual = await fsp.readdir(path.join(__dirname, ".test", BUILD_DIRNAME));
            assert.deepEqual(actual, expected);
        });
    });

    describe("makeId()", () => {
        it("should return a sanitized id (az_)", () => {
            assert.match(makeId("test-project", "@org/pipeline-module-test", "demo"), /^[a-z_]+$/);
            assert.match(makeId("12QZer^$;!", "12QZer^$;!", "12QZer^$;!"), /^[a-z_]+$/);
        });
    });
    describe("makeSlug()", () => {
        it("should return a sanitized slug (az-)", () => {
            assert.match(makeSlug("test-project", "@org/pipeline-module-test", "demo"), /^[a-z-]+$/);
            assert.match(makeSlug("12QZer^$;!", "12QZer^$;!", "12QZer^$;!"), /^[a-z-]+$/);
        });
    });
    describe("makeDomain()", () => {
        it("should return a sanitized domain (az-.)", () => {
            assert.match(makeDomain("test-project", "@org/pipeline-module-test", "demo"), /^[a-z-.]+$/);
            assert.match(makeDomain("12QZer^$;!", "12QZer^$;!", "12QZer^$;!"), /^[a-z-.]+$/);
        });
    });
    describe("createBuildDirectory()", () => {
        let resourcesPaths;
        let paths;
        before(async () => {
            await fse.mkdirp(path.join(__dirname, ".test"));
            await fse.mkdirp(path.join(__dirname, ".test", BUILD_DIRNAME));
            await fse.mkdirp(path.join(__dirname, ".test", "src", "demo", "public"));
        });
        after(async () => {
            await fse.remove(path.join(__dirname, ".test"));
        });
        it("should not throw", async () => {
            const { resources: _resourcesPaths, ..._paths } = await createBuildDirectory(
                path.join(__dirname, ".test"),
                { output: path.join(__dirname, ".test", BUILD_DIRNAME) },
                { demo: { src: path.join(__dirname, ".test", "src", "demo") } }
            );
            resourcesPaths = _resourcesPaths;
            paths = _paths;
        });
        it("should return the repo relative path", () => {
            assert.equal(paths.repo, path.relative(process.cwd(), path.join(__dirname, ".test")));
        });
        it("should return the repo--build and build--repo relative paths", () => {
            assert.equal(paths.build, BUILD_DIRNAME);
            // eslint-disable-next-line no-underscore-dangle
            assert.equal(paths._build, "..");
        });
        it("should return the repo--src, src--repo, repo--res and res--repo relative paths for each resource", () => {
            assert.deepEqual(resourcesPaths, {
                demo: {
                    src: path.join("src", "demo"),
                    _src: path.join("..", ".."),
                    res: "demo",
                    _res: ".."
                }
            });
        });
    });
});
