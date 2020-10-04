const path = require("path");
const fsp = require("fs").promises;

module.exports = ({ BUILD_DIRNAME }) => async (repo, { output } = {}) => {
    await Promise.all(
        (await fsp.readdir(path.join(__dirname, "infra"))).map(filename =>
            fsp.copyFile(
                path.join(__dirname, "infra", filename),
                path.join(output || path.join(repo, BUILD_DIRNAME), filename)
            )
        )
    );
};
