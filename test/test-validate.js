/* eslint-env mocha */

const chai = require("chai");
chai.use(require("chai-as-promised"));

const { assert } = chai;

const { version: VERSION, name: NAME } = require("../package.json");

const validateVersionCompatibility = require("../lib/validate/validateVersionCompatibility")({ VERSION });
const validateSchema = require("../lib/validate/validateSchema");
const loadModules = require("../lib/validate/loadModules")({ VERSION, NAME });

describe("lib/validate", () => {
    describe("validateVersionCompatibility()", () => {
        it("should ensure configuration version compatibility", () => {
            assert.doesNotThrow(() => validateVersionCompatibility(VERSION));
            assert.throws(() => validateVersionCompatibility("0.0.0"));
        });
    });
    describe("validateSchema()", () => {
        it("should validate configuration version-specific schema", () => {
            assert.doesNotThrow(() =>
                validateSchema({
                    version: VERSION,
                    namespace: "test",
                    resources: {}
                })
            );
            assert.throws(() => validateSchema({}));
        });
    });
    describe("loadModules()", () => {
        it("should ensure that all modules referenced are installed and compatible", () => {
            assert.doesNotThrow(() => loadModules([]));
            assert.throws(() => loadModules(["module-that-doesnt-exist"]));
        });
    });
    describe("validateModulesOptionSchemas()", () => {
        it("should validate pipelines option schemas");
    });

    it("should ensure that the repository is initialized");
});
