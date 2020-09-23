
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

## How to use

Prerequisites

- an AWS Account
- a fresh git repository
- a Gitlab account configured so that your AWS credentials are accessible from the repository CI/CD pipeline

Install the package at the root of a monorepo

```bash
npm install @hauslo/pipeline
```

Create a `.pipeline.yml` configuration file

```yaml
pipelines:
  - module: @hauslo/pipeline-asset-static
    namespace: assets/static
```

Create a simple `assets/static/test/index.html` file

Now just commit and push to `master`

```bash
git add .
git commit -m "Test pipeline"
git push
```

And that's it, if your Gitlab CI was configured with AWS credentials the static website in `assets/static/test/` will have been deployed to AWS S3 from the ci/cd.

## Modules

### asset-static

*todo*

### asset-node

*todo*

### asset-gatsby

*todo*

### docker-node

*todo*

### docker

*todo*