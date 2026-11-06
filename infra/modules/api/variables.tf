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

variable "jwt_issuer" {
  description = "Token issuer URL (the Cognito user pool)"
  type        = string
}

variable "jwt_audience" {
  description = "App client IDs allowed to call the API"
  type        = list(string)
}

variable "allowed_origins" {
  description = "Websites allowed to call the API from the browser"
  type        = list(string)
}
