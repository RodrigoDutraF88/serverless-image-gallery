# configure the aws provider

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region  = "us-east-1"
  profile = "dev"
}

# private bucket for uploaded images

module "storage" {
  source = "../../modules/storage"

  bucket_name = "rodrigo-private-bucket"
  environment = "dev"
}

module "presign_upload" {
  source = "../../modules/compute"

  function_name = "presign-upload-dev"
  source_dir    = "${path.module}/../../../backend/functions/presign_upload"
  bucket_name   = module.storage.bucket_name
  bucket_arn    = module.storage.bucket_arn
}

output "bucket_name" {
  value = module.storage.bucket_name
}
