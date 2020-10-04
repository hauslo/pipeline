const semver = require("semver");

module.exports = ({ VERSION }) => version => {
    if (!semver.satisfies(VERSION, version)) {
        throw new Error("Incompatible pipeline configuration file version");
    }
};
