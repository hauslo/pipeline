const path = require("path");
const yaml = require("js-yaml");
const fsp = require("fs").promises;

const { version: VERSION, name: NAME } = require("../../package.json");
const { PIPELINE_FILENAME } = require("../config.json");

const validateVersionCompatibility = require("./validateVersionCompatibility")({ VERSION });
const validateSchema = require("./validateSchema");
const loadModules = require("./loadModules")({ VERSION, NAME });
const validateModulesOptionSchemas = require("./validateModulesOptionSchemas");
const validateRepo = require("../share/validateRepo");

// eslint-disable-next-line no-unused-vars
module.exports = async (repo, options = {}) => {
    // eslint-disable-next-line no-param-reassign
    repo = validateRepo(repo);
    let config;

    try {
        config = await fsp.readFile(path.join(repo, PIPELINE_FILENAME), "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            throw new Error(`Couldn't find ${PIPELINE_FILENAME} in ${repo}\n${repo} must be initialized`);
        } else {
            throw err;
        }
    }

    config = yaml.safeLoad(config);

    validateVersionCompatibility(config.version);
    validateSchema(config);
    config.resources = config.resources || {};
    const modules = loadModules(Object.values(config.resources).map(resource => resource.module));
    validateModulesOptionSchemas(modules, config.resources);

    return { repo, config, modules };
};
