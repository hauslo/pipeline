const semver = require("semver");

module.exports = ({ VERSION, NAME }) => moduleNames =>
    moduleNames.reduce((modules, moduleName) => {
        // eslint-disable-next-line import/no-dynamic-require, global-require, no-param-reassign
        modules[moduleName] = require(moduleName);
        const module = modules[moduleName];
        if (module.versionCompatibility && !semver.satisfies(VERSION, module.versionCompatibility)) {
            throw new Error(`${moduleName} not compatible with ${NAME}@${VERSION}`);
        }
        return modules;
    }, {});
