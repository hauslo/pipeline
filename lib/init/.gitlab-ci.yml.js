const path = require("path");

module.exports = ({ GITLAB_CI_FILENAME, BUILD_DIRNAME }) => (repo, { output }) => `
include:
 - ${path.join(output || path.join(repo, BUILD_DIRNAME), GITLAB_CI_FILENAME)}

`;
