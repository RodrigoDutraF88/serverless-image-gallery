variable "api_name" {
  description = "Name of the HTTP API"
  type        = string
}

variable "routes" {
  description = "Route key (\"METHOD /path\") mapped to the Lambda that handles it"
  type = map(object({
    function_name = string
    invoke_arn    = string
  }))
}