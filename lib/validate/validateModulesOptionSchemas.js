module.exports = (modules, resources) =>
    Object.values(resources).forEach(
        ({ module, options }) => modules[module].validate && modules[module].validate(options)
    );
