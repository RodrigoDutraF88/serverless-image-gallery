variable "api_name" {
  description = "Name of the HTTP API"
  type        = string
}

variable "lambda_function_name" {
  description = "Function that handles POST /upload-url"
  type        = string
}

variable "lambda_invoke_arn" {
  description = "Invoke ARN of that function"
  type        = string
}