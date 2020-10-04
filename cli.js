#!/usr/bin/env node

/* eslint no-console: "off" */

const cli = require("./lib/cli");
const { init, build, validate } = require("./index.js");

const cmd = cli();

switch (cmd.cmd) {
    case "init":
        init(cmd.repo, cmd.options)
            .then(() => {
                console.log(`${cmd.repo} successfully initialized`);
            })
            .catch(err => {
                console.error(err.message);
                console.error(err);
            });
        break;
    case "validate":
        validate(cmd.repo, cmd.options)
            .then(() => {
                console.log(`${cmd.repo} configuration successfully validated`);
            })
            .catch(err => {
                console.error(err.message);
                console.error(err);
            });
        break;
    case "build":
        build(cmd.repo, cmd.options)
            .then(() => {
                console.log(`${cmd.repo} successfully built`);
            })
            .catch(err => {
                console.error(err.message);
                console.error(err);
            });
        break;
    case "help":
        cli.help();
        break;
    default:
        cli.help();
        cli.exit(1);
}
