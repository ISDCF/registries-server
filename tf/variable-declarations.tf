variable "region" {
  type        = string
  description = "AWS region"
}

variable "registry_repository" {
  type        = string
  description = "Upstream Git Registry Repository"
}

variable "app_ver" {
  type        = string
  description = "Application Version"
}
