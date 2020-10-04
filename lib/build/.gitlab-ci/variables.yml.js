module.exports = ({ paths }) => `
variables:
  TF_VAR_address: \${CI_API_V4_URL}/projects/\${CI_PROJECT_ID}/terraform/state/infra
  TF_VAR_ci_registry: $CI_REGISTRY
  TF_VAR_ci_registry_user: $CI_REGISTRY_USER
  TF_VAR_ci_registry_password: $CI_REGISTRY_PASSWORD
  PATH_TO_BUILD: ${paths.build}
  PATH_FROM_BUILD: ${paths._build}
`;
