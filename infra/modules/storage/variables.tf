
variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "allowed_origins" {
  description = "Websites allowed to upload from the browser"
  type        = list(string)
}
