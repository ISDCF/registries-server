ISDCF Registries Server
=======================

_EXPERIMENTAL_

A JSON-based registries server synchronized to the [ISDCF Registries](https://github.com/ISDCF/registries/).

The running service may be found here:

   * https://registry.isdcf.com

### Environment

The registry feeding this API may be changed in `package.json` or optionally overridden with the `REGISTRY_REPOSITORY` environment variable.

---

## Installation

To run locally:

```shell
$ git clone <repo>
$ cd registry-server
$ npm install
$ npm start
```

### Initial Deploy to AWS Elastic Beanstalk (using [Terraform](https://www.terraform.io))

```shell
$ rm -rf node_modules/
$ cd tf
$ export AWS_ACCESS_KEY_ID=<your secret>
$ export AWS_SECRET_ACCESS_KEY=<your secret>
$ terraform init
$ terraform plan
$ terraform apply
$ aws elasticbeanstalk update-environment ... (see final command output from previous step)
```
