# pipeline

Heavily opinionated automated test, build and deploy pipelines.

Makes prod-faring development a joy.

## Opinionated

- Monorepo
- Gitlab
- Gitlab CI/CD
- AWS
- AWS S3, EC2 (IAM, Scaling Groups, VPCs, ...)
- Terraform
- Docker

## ToC

- [pipeline](#pipeline)
  - [Opinionated](#opinionated)
  - [ToC](#toc)
  - [How to use](#how-to-use)
  - [Modules](#modules)
    - [Infrastructure modules](#infrastructure-modules)
  - [Todo and ideas](#todo-and-ideas)
  - [Write a module](#write-a-module)
    - [Namespacing](#namespacing)
    - [Versionning](#versionning)
    - [Terraform](#terraform)

## How to use

Prerequisites

- a Gitlab repo configured so that the CI/CD pipeline has access to the remote terraform state (define the `TF_VAR_ci_registry_password` and `TF_VAR_ci_registry_user` environment variables in `Settings > CI/CD > Variables`) see <https://docs.gitlab.com/ee/user/infrastructure/#get-started-using-local-development>. Other secrets will most likely be required by various modules.

Install the package at the root of a repo/monorepo

```bash
npm install @hauslo/pipeline
```

Generate a `.pipeline.yml` configuration file

```bash
npx @hauslo/pipeline init
```

Add a resource to `.pipeline.yml`

```yaml
version: x.x.x
namespace: xxxxxx
resources:
  demo:
    module: @hauslo/pipeline-website-static
    src: website/demo
    options: {}
```

Install the modules as required

```bash
npm install @hauslo/pipeline-website-static
```

Create a simple `websites/demo/public/index.html` file

Now just commit and push to `master`

```bash
git add .
git commit -m "Test pipeline"
git push
```

And that's it, if your Gitlab CI was configured with AWS credentials the static website in `websites/demo/public` will have been deployed to S3 from the ci/cd pipeline.

---

## Modules

- [@hauslo/pipeline-website-static](https://www.npmjs.com/package/@hauslo/pipeline-website-static)
- _website-node_
- _website-gatsby_
- _docker-app_
- _docker-node_
- _function-node_

### Infrastructure modules

- [@hauslo/infra-website](https://github.com/hauslo/infra-website)

---

## Todo and ideas

- [@hauslo/infra-website](https://github.com/hauslo/infra-website)

  - limit access to origin

- _proxy_

  - cloudflare reverse proxy for SSL, CDN and WAF

- [@hauslo/pipeline-website-static](https://www.npmjs.com/package/@hauslo/pipeline-website-static)
  - `proxy` option

---

## Write a module

Modules are npm packages, they must be installed in the repository alongside `@hauslo/pipeline`.

A module must export an async function that will receive a single object as argument, the signature of this object is

```yaml
version: string
namespace: string
module: string
name: string
paths: object<string>
options: object<*>|undefined
id: string
domain: string
```

Where

- `version` is the version of `@hauslo/pipeline`, the argument object signature depends on this value. A module can ignore this argument if it exports `.versionCompatibility` (ex: `1.0.0` implies `^1.0.0`, `semver.satisfies()` is used)
- `namespace` is a project namespace (ex: `test/demo`, any character is acceptable but the namespace will be trimmed down as necessary when namespacing resources)
- `module` is the module name given in `.pipeline.yml` (ex: `@hauslo/pipeline-website-static`)
- `name` is the resource name, as defined in `.pipeline.yml`
- `paths` helps modules to navigate the project repository. These paths are expected to be used to build the pipeline.
- `options` is the module options object found in `.pipeline.yml`. It may contain values to configure the module's behavior. If the module exposes a `validate(options: *)` method then it is used to validate the user options
- `id` is the resource unique identifier, it includes the project namespace, the pipeline module name, and the resource name. This `id`, and the next `domain`, should be used to name the built ci/cd pipeline and infrastructure (ex: `app__hauslo_website_static__demo`)
- `domain` is the same as `id` but is more suited to name some infrastructure resources (ex: `demo.hauslo-website-static.app`)

An example of `paths` :

```json
{
 "repo": ".",
 "src": "front/demo",
 "_src": "../..",
 "build": ".pipeline",
 "_build": "..",
 "res": "front/demo",
 "_res": "../.."
}
```

Where

- `repo` is the path to the root of the repository from the execution context (the execution context for the `pipeline build` command, not for `.gitlab-ci.yml` or terraform, for `.gitlab-ci.yml` the execution context is the repo root, for terraform the execution context is `build` so the repo path is `_build`)
- `src` is the path to the resource subrepo from `repo` (ex: `websites/demo/`)
- `build` is the path to the pipeline build root from `repo` (ex: `.pipeline/`)
- `res` is the path to the resource-specific build from the pipeline build root (ex: `website-static/demo/` for `.pipeline/website-static/demo`)

And

- `_<path>` is the reverse of `<path>` for `src`, `build` and `res`

Modules can place shared build artifacts in `build` (terraform configuration files for instance as this is the terraform execution context) and private build artifacts in `build/res`

The async function exported by the module can return an object

```yaml
gitlabCiInclude: string|array<string>
```

Where

- `gitlabCiInclude` is the path to a `.gitlab-ci.yml` file to include from the main `.gitlab-ci.yml`

### Namespacing

For sanity, infrastructure resources should be named after `id` or `domain`.

### Versionning

To ensure that a module is only ever used with a compatible version of `pipeline`, it can export a `versionCompatibility` property with a semver version number (ex: `module.exports.versionCompatibility = "1.0.0";`)

### Terraform

Modules can place shared build artifacts in `build` (terraform configuration files for instance as this is the terraform execution context) and private build artifacts in `build/res`.

Modules terraform configurations can declare the variables `ci_registry`, `ci_registry_user` and `ci_registry_password`, these variables will be passed as environment variables from [.gitlab-ci.yml](lib/build/.gitlab-ci/variables.yml.js).

Modules should document other secrets they require and users should define these secrets in Gitlab CI environment variables (ex: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

```hcl
variable "ci_registry" {
  type        = string
}
variable "ci_registry_user" {
  type        = string
}
variable "ci_registry_password" {
  type        = string
}
```
