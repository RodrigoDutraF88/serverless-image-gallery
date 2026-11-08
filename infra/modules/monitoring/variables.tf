variable "name_prefix" {
  description = "Prefix for the topic and alarm names"
  type        = string
}

variable "alert_email" {
  description = "Email address that receives alarm notifications"
  type        = string
}

variable "function_names" {
  description = "Lambda functions to watch for errors"
  type        = list(string)
}

variable "api_id" {
  description = "ID of the HTTP API to watch for 5xx responses"
  type        = string
}
