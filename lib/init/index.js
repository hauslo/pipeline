const path = require("path");
const errcode = require("err-code");
const fsp = require("fs").promises;

const { version: VERSION } = require("../../package.json");
const { PIPELINE_FILENAME, GITLAB_CI_FILENAME, BUILD_DIRNAME } = require("../config.json");

const pipelineContent = require("./.pipeline.yml.js")({ VERSION });
const gitlabCiContent = require("./.gitlab-ci.yml.js")({ GITLAB_CI_FILENAME, BUILD_DIRNAME });
const validateRepo = require("../share/validateRepo");

module.exports = async (repo, options = {}) => {
    // eslint-disable-next-line no-param-reassign
    repo = validateRepo(repo);
    const pipelineFile = path.join(repo, PIPELINE_FILENAME);
    const gitlabCiFile = path.join(repo, GITLAB_CI_FILENAME);
    const renderedPipelineContent = pipelineContent(repo);
    const renderedGitlabCiContent = gitlabCiContent(repo, options);
    if (options.force) {
        await fsp.writeFile(pipelineFile, renderedPipelineContent);
        await fsp.writeFile(gitlabCiFile, renderedGitlabCiContent);
    } else {
        const swallowEnoent = async err => {
            if (err.code !== "ENOENT") {
                throw err;
            } else {
                return undefined;
            }
        };
        const currentPipelineContent = await fsp.readFile(pipelineFile).catch(swallowEnoent);
        const currentGitlabCiContent = await fsp.readFile(gitlabCiFile).catch(swallowEnoent);

        if (currentPipelineContent !== undefined && currentPipelineContent.toString() !== renderedPipelineContent) {
            throw errcode(new Error(`Modified ${PIPELINE_FILENAME} found in ${repo}`), "EEXIST");
        }
        if (currentGitlabCiContent !== undefined && currentGitlabCiContent.toString() !== renderedGitlabCiContent) {
            throw errcode(new Error(`Modified ${GITLAB_CI_FILENAME} found in ${repo}`), "EEXIST");
        }

        if (currentPipelineContent === undefined) {
            await fsp.writeFile(pipelineFile, renderedPipelineContent);
        }
        if (currentGitlabCiContent === undefined) {
            await fsp.writeFile(gitlabCiFile, renderedGitlabCiContent);
        }
    }
};
