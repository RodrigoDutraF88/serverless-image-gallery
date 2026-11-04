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

data "aws_iam_policy_document" "presign_upload" {
  statement {
    actions   = ["s3:PutObject"]
    resources = ["${module.storage.bucket_arn}/uploads/*"]
  }
}

module "presign_upload" {
  source = "../../modules/compute"

  function_name = "presign-upload-dev"
  source_dir    = "${path.module}/../../../backend/functions/presign_upload"
  policy_json   = data.aws_iam_policy_document.presign_upload.json

  environment_variables = {
    BUCKET_NAME = module.storage.bucket_name
  }
}

output "bucket_name" {
  value = module.storage.bucket_name
}

module "api" {
  source = "../../modules/api"

  api_name     = "image-gallery-dev"
  jwt_issuer   = module.auth.issuer
  jwt_audience = [module.auth.client_id]

  routes = {
    "POST /upload-url" = {
      function_name = module.presign_upload.function_name
      invoke_arn    = module.presign_upload.invoke_arn
    }
    "GET /images" = {
      function_name = module.list_images.function_name
      invoke_arn    = module.list_images.invoke_arn
    }
    "GET /images/search" = {
      function_name = module.search_by_tag.function_name
      invoke_arn    = module.search_by_tag.invoke_arn
    }
    "DELETE /images/{id}" = {
      function_name = module.delete_image.function_name
      invoke_arn    = module.delete_image.invoke_arn
    }
  }
}
output "api_url" {
  value = module.api.api_url
}

# pillow layer for image processing

data "archive_file" "pillow_layer" {
  type        = "zip"
  source_dir  = "${path.module}/../../../build/layers/pillow"
  output_path = "${path.module}/../../../build/pillow-layer.zip"
}

resource "aws_lambda_layer_version" "pillow" {
  layer_name          = "pillow"
  filename            = data.archive_file.pillow_layer.output_path
  source_code_hash    = data.archive_file.pillow_layer.output_base64sha256
  compatible_runtimes = ["python3.13"]
}

# process_image: read uploads/, write thumbnails/, call Rekognition

data "aws_iam_policy_document" "process_image" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.storage.bucket_arn}/uploads/*"]
  }
  statement {
    actions   = ["s3:PutObject"]
    resources = ["${module.storage.bucket_arn}/thumbnails/*"]
  }
  statement {
    actions   = ["rekognition:DetectLabels"]
    resources = ["*"]
  }
  statement {
    actions   = ["dynamodb:PutItem", "dynamodb:BatchWriteItem"]
    resources = [module.database.table_arn]
  }
}

module "process_image" {
  source = "../../modules/compute"

  function_name = "process-image-dev"
  source_dir    = "${path.module}/../../../backend/functions/process_image"
  policy_json   = data.aws_iam_policy_document.process_image.json
  layers        = [aws_lambda_layer_version.pillow.arn]
  timeout       = 30
  memory_size   = 512
  environment_variables = {
    TABLE_NAME = module.database.table_name
  }
}

# trigger process_image on every new object in uploads/

resource "aws_lambda_permission" "s3_invoke_process_image" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = module.process_image.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = module.storage.bucket_arn
}

resource "aws_s3_bucket_notification" "uploads" {
  bucket = module.storage.bucket_name

  lambda_function {
    lambda_function_arn = module.process_image.function_arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
  }

  depends_on = [aws_lambda_permission.s3_invoke_process_image]
}

# metadata and tags

module "database" {
  source = "../../modules/database"

  table_name = "image-gallery-dev"
}

# gallery API: list, search and delete images

data "aws_iam_policy_document" "read_images" {
  statement {
    actions   = ["dynamodb:Query"]
    resources = [module.database.table_arn]
  }
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.storage.bucket_arn}/thumbnails/*"]
  }
}

data "aws_iam_policy_document" "delete_image" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:BatchWriteItem"]
    resources = [module.database.table_arn]
  }
  statement {
    actions = ["s3:DeleteObject"]
    resources = [
      "${module.storage.bucket_arn}/uploads/*",
      "${module.storage.bucket_arn}/thumbnails/*",
    ]
  }
}

module "list_images" {
  source = "../../modules/compute"

  function_name = "list-images-dev"
  source_dir    = "${path.module}/../../../backend/functions/list_images"
  policy_json   = data.aws_iam_policy_document.read_images.json

  environment_variables = {
    TABLE_NAME  = module.database.table_name
    BUCKET_NAME = module.storage.bucket_name
  }
}

module "search_by_tag" {
  source = "../../modules/compute"

  function_name = "search-by-tag-dev"
  source_dir    = "${path.module}/../../../backend/functions/search_by_tag"
  policy_json   = data.aws_iam_policy_document.read_images.json

  environment_variables = {
    TABLE_NAME  = module.database.table_name
    BUCKET_NAME = module.storage.bucket_name
  }
}

module "delete_image" {
  source = "../../modules/compute"

  function_name = "delete-image-dev"
  source_dir    = "${path.module}/../../../backend/functions/delete_image"
  policy_json   = data.aws_iam_policy_document.delete_image.json

  environment_variables = {
    TABLE_NAME  = module.database.table_name
    BUCKET_NAME = module.storage.bucket_name
  }
}

# sign-up / sign-in

module "auth" {
  source = "../../modules/auth"

  pool_name = "image-gallery-dev"
}

output "user_pool_client_id" {
  value = module.auth.client_id
}
