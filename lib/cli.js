const yargs = require("yargs");
const { version: VERSION } = require("../package.json");
const { PIPELINE_FILENAME, GITLAB_CI_FILENAME, BUILD_DIRNAME } = require("./config.json");

const cli = yargs
    .version(VERSION)
    .usage("Usage: $0 help")
    .demandCommand(1)
    .showHelpOnFail(false)
    .exitProcess(false)
    .help(false)
    .fail(() => {})
    .command(
        "init [repository]",
        `Create the configuration files ${PIPELINE_FILENAME} and ${GITLAB_CI_FILENAME} if they don't exist`,
        command =>
            command.option("force", {
                alias: "f",
                describe: `Override the current ${GITLAB_CI_FILENAME} and ${PIPELINE_FILENAME}`,
                type: "boolean"
            })
    )
    .command("validate [repository]", "Validate the pipeline configuration")
    .command("build [repository]", "Build the repository pipeline", command =>
        command.option("output", {
            alias: "o",
            describe: `Build directory, defaults to ${BUILD_DIRNAME}`,
            type: "string"
        })
    );

module.exports = cmdLine => {
    const cmd = cmdLine ? cli.parse([...cmdLine]) : cli.argv;
    const args = cmd._;
    const name = args.shift();

    if (args.length > 0) {
        return {};
    }

    switch (name) {
        case "init":
            return {
                cmd: name,
                repo: cmd.repository,
                options: {
                    force: !!cmd.force
                }
            };
        case "validate":
            return {
                cmd: name,
                repo: cmd.repository,
                options: {}
            };
        case "build":
            return {
                cmd: name,
                repo: cmd.repository,
                options: {
                    merge: !!cmd.merge,
                    output: cmd.output || cmd.o
                }
            };
        case "help":
            return {
                cmd: "help"
            };
        default:
            return {};
    }
};
module.exports.help = () => cli.showHelp();
module.exports.exit = code => cli.exit(code);
