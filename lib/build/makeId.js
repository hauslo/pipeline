const sanitizeDomainString = str =>
    str
        .toLowerCase()
        .replace(/([^a-z-]+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-/, "")
        .replace(/-$/, "");
const sanitizeIdString = str =>
    str
        .toLowerCase()
        .replace(/([^a-z_]+)/g, "_")
        .replace(/(_+)/g, "_")
        .replace(/^_/, "")
        .replace(/_$/, "");
const sanitizeSlugString = str =>
    str
        .toLowerCase()
        .replace(/[^a-z-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-/, "")
        .replace(/-$/, "");
const trimModuleOrg = str => {
    const match = str.match(/(^@[^/]+?)\/(.+)/);
    return match ? match[2] : str;
};

const makeId = (namespace, module, name) =>
    `${sanitizeIdString(namespace)}__${sanitizeIdString(trimModuleOrg(module))}__${sanitizeIdString(name)}`;
const makeSlug = (namespace, module, name) =>
    `${sanitizeSlugString(namespace)}-${sanitizeSlugString(trimModuleOrg(module))}-${sanitizeSlugString(name)}`;
const makeDomain = (namespace, module, name) =>
    `${sanitizeDomainString(name)}.${sanitizeDomainString(trimModuleOrg(module))}.${sanitizeDomainString(namespace)}`;

module.exports = { makeId, makeSlug, makeDomain };
