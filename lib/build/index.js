// eslint-disable-next-line no-unused-vars
const { GITLAB_CI_FILENAME, BUILD_DIRNAME } = require("../config.json");
const { version: VERSION } = require("../../package.json");

const validate = require("../validate");
const ensureBuildDirectoryEmpty = require("./ensureBuildDirectoryEmpty")({
    BUILD_DIRNAME
});
const createBuildDirectory = require("./createBuildDirectory")({
    BUILD_DIRNAME
});
const { makeId, makeSlug, makeDomain } = require("./makeId");
const renderGitlabCi = require("./renderGitlabCi")({
    BUILD_DIRNAME,
    GITLAB_CI_FILENAME
});
const renderTf = require("./renderTf")({
    BUILD_DIRNAME
});

module.exports = async (_repo, options) => {
    const { repo, config, modules } = await validate(_repo);
    await ensureBuildDirectoryEmpty(repo, options);
    const { resources: resourcesPaths, ...paths } = await createBuildDirectory(repo, options, config.resources);
    let gitlabCiIncludes = [];

    await Promise.all(
        Object.keys(config.resources).map(name =>
            modules[config.resources[name].module]({
                version: VERSION,
                namespace: config.namespace,
                module: config.resources[name].module,
                name,
                paths: { ...resourcesPaths[name], ...paths },
                options: config.resources[name].options,
                id: makeId(config.namespace, config.resources[name].module, name),
                domain: makeDomain(config.namespace, config.resources[name].module, name),
                slug: makeSlug(config.namespace, config.resources[name].module, name)
            })
        )
    ).then(artifactsAll => {
        const artifacts = artifactsAll.flat();
        if (artifacts.gitlabCiInclude) {
            if (typeof artifacts.gitlabCiInclude === "string") {
                gitlabCiIncludes.push(artifacts.gitlabCiInclude);
            } else {
                gitlabCiIncludes = [].concat(gitlabCiIncludes, artifacts.gitlabCiInclude);
            }
        }
    });

    await renderGitlabCi(repo, options, { includes: gitlabCiIncludes, paths });
    await renderTf(repo, options);
};
