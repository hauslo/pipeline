const path = require("path");
const fse = require("fs-extra");

const createDirectories = async (root, dirs = {}) => {
    const paths = {};
    await fse.mkdirp(root);
    await Promise.all(
        Object.keys(dirs).map(dir => {
            paths[dir] = path.relative(root, path.resolve(root, dirs[dir]));
            return fse.mkdirp(path.resolve(root, paths[dir]));
        })
    );
    return { root, dirs: paths };
};

module.exports = ({ BUILD_DIRNAME }) => async (repo, { output } = {}, resources) =>
    createDirectories(
        output ? path.resolve(output) : path.join(repo, BUILD_DIRNAME),
        Object.keys(resources).reduce((dirs, name) => Object.assign(dirs, { [name]: name }), {})
    ).then(({ root: build, dirs }) => ({
        repo: path.relative(process.cwd(), repo),
        build: path.relative(repo, build),
        _build: path.relative(build, repo),
        resources: Object.keys(resources).reduce(
            (resourcesPaths, name) =>
                Object.assign(resourcesPaths, {
                    [name]: {
                        res: dirs[name],
                        _res: path.relative(path.resolve(build, dirs[name]), build),
                        src: path.relative(repo, resources[name].src),
                        _src: path.relative(resources[name].src, repo)
                    }
                }),
            {}
        )
    }));
