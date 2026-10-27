variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
}

variable "source_dir" {
  description = "Folder containing the function code"
  type        = string
}

variable "bucket_name" {
  description = "Bucket the function generates upload URLs for"
  type        = string
}

variable "bucket_arn" {
  description = "ARN of that bucket, used in the IAM policy"
  type        = string
}