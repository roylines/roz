provider "aws" {
  region = "us-east-1"
}

variable "telegram_token" {
}

variable "name" {
  default = "roz"
}
