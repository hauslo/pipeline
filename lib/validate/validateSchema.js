const Ajv = require("ajv");

const ajv = new Ajv();
const validate = ajv.compile(require("../../schema/pipeline.schema.json"));

module.exports = config => {
    if (!validate(config)) {
        const err = new Error(
            `Invalid pipeline configuration${
                validate.errors.length > 0 ? validate.errors.map(error => `\n - ${error.message}`).join() : ""
            }`
        );
        err.validationErrors = validate.errors;
        throw err;
    }
};
