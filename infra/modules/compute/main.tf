# who may use this role: only the Lambda service

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = "${var.function_name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

# permission to write logs to CloudWatch

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# permission to put objects, only under uploads/

data "aws_iam_policy_document" "s3_put" {
  statement {
    actions   = ["s3:PutObject"]
    resources = ["${var.bucket_arn}/uploads/*"]
  }
}

resource "aws_iam_role_policy" "s3_put" {
  name   = "s3-put-uploads"
  role   = aws_iam_role.this.id
  policy = data.aws_iam_policy_document.s3_put.json
}

# keep logs 7 days instead of forever

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7
}

# zip the code and create the function

data "archive_file" "this" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/build/${var.function_name}.zip"
}

resource "aws_lambda_function" "this" {
  function_name    = var.function_name
  role             = aws_iam_role.this.arn
  runtime          = "python3.13"
  handler          = "app.handler"
  filename         = data.archive_file.this.output_path
  source_code_hash = data.archive_file.this.output_base64sha256
  timeout          = 10

  environment {
    variables = {
      BUCKET_NAME = var.bucket_name
    }
  }

  depends_on = [aws_cloudwatch_log_group.this]
}
