const path = require("path");
const fsp = require("fs").promises;
const gitlabCi = require("./.gitlab-ci.yml.js");

module.exports = ({ BUILD_DIRNAME, GITLAB_CI_FILENAME }) => async (repo, { output } = {}, { includes, paths }) => {
    const renderedGitlabCi = await gitlabCi({ includes, paths });
    await fsp.writeFile(path.join(output || path.join(repo, BUILD_DIRNAME), GITLAB_CI_FILENAME), renderedGitlabCi);
};
