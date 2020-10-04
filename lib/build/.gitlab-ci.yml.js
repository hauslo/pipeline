const path = require("path");
const { readFile } = require("fs").promises;

module.exports = async ({ includes, paths }) => {
    const templatesDirectory = path.join(__dirname, ".gitlab-ci");
    const variables = require(path.join(templatesDirectory, "variables.yml.js"))({ paths });
    const stages = await readFile(path.join(templatesDirectory, "stages.yml"), "utf8");
    const deployStages = [
        await readFile(path.join(templatesDirectory, "before_deploy.yml"), "utf8"),
        await readFile(path.join(templatesDirectory, "test_before_deploy.yml"), "utf8"),
        await readFile(path.join(templatesDirectory, "deploy.yml"), "utf8")
    ];

    return `
${stages}
${variables}
${includes.length > 0 ? "include:\n  - " : ""}
${includes.join("\n  - ")}

${deployStages.join()}`;
};
