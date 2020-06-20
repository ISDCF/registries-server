provider "aws" {
  region = var.region
}

data "archive_file" "app_zip" {
  type        = "zip"
  source_dir  = "${path.root}/.."
  output_path = "/tmp/app-${var.app_ver}.zip"
}

resource "aws_s3_bucket" "default" {
  bucket = "isdcf-registry-server-source-code"
}

resource "aws_s3_bucket_object" "default" {
  bucket = aws_s3_bucket.default.id
  key    = "beanstalk-app-${var.app_ver}.zip"
  source = data.archive_file.app_zip.output_path
}

resource "aws_elastic_beanstalk_application" "default" {
  name        = "ISDCF-Registry-Server"
  description = "ISDCF Registry Server"
}

resource "aws_elastic_beanstalk_application_version" "default" {
  name        = "isdcf-registry-server-app-version-${var.app_ver}"
  application = aws_elastic_beanstalk_application.default.name
  description = "ISDCF Application Version"
  bucket      = aws_s3_bucket.default.id
  key         = aws_s3_bucket_object.default.id
}

resource "aws_elastic_beanstalk_environment" "default" {
  name                   = "ISDCF-Registry-Server-Env"
  application            = aws_elastic_beanstalk_application.default.name
  solution_stack_name    = "64bit Amazon Linux 2 v5.0.2 running Node.js 12"
  cname_prefix           = "isdcf-registry"
  tier                   = "WebServer"
  wait_for_ready_timeout = "10m"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = "aws-elasticbeanstalk-ec2-role"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REGISTRY_REPOSITORY"
    value     = var.registry_repository
  }

}

output "url" {
  value = "http://${aws_elastic_beanstalk_environment.default.cname_prefix}.${var.region}.elasticbeanstalk.com"
}

output "deploy_final_command" {
  value = "aws --region ${var.region} elasticbeanstalk update-environment --environment-name ${aws_elastic_beanstalk_environment.default.name} --version-label ${aws_elastic_beanstalk_application_version.default.name}"
}
