const path = require("path");
const fse = require("fs-extra");
const fsp = require("fs").promises;

module.exports = ({ BUILD_DIRNAME }) => async (repo, { output } = {}) => {
    const buildDir = path.join(repo, BUILD_DIRNAME);
    if (output !== undefined && path.resolve(output) !== buildDir) {
        const files = await fsp.readdir(output).catch(err => {
            if (err.code !== "ENOENT") {
                throw err;
            } else {
                return [];
            }
        });
        if (files.length > 0) {
            throw new Error(`Build directory ${path.relative(process.cwd(), output)} is not empty`);
        }
    } else {
        await fse.emptyDir(buildDir);
    }
};
