ISDCF Registries Server
=======================

_EXPERIMENTAL_

A JSON-based registries server synchronized to the registries found at:

 * https://github.com/ISDCF/registries/

---

### Installation

To run locally:

```shell
$ git clone <repo>
$ cd registry-server
$ npm install
$ export REGISTRY_REPOSITORY="https://github.com/ISDCF/registries/"
$ npm start
```

### Deploy to AWS Elastic Beanstalk

```shell
$ export AWS_ACCESS_KEY_ID=<your secret>
$ export AWS_SECRET_ACCESS_KEY=<your secret>
$ export AWS_REGION=us-west-1  # or other region
$ export REGISTRY_REPOSITORY="https://github.com/ISDCF/registries/"
$ npm run deploy
```

### Deploy to AWS Elastic Beanstalk (using [Terraform](https://www.terraform.io))

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
