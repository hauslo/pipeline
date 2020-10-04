const path = require("path");

module.exports = ({ VERSION }) => repo => `# See https://github.com/hauslo/pipeline

version: ${VERSION}
namespace: ${path.basename(repo)}

#resources:
#  demo:
#    src: website/demo
#    module: @hauslo/pipeline-website-static
`;
