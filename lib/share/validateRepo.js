const path = require("path");

module.exports = (repo = process.cwd()) => path.resolve(repo);
