// load the AWS  provider, and set region
provider "aws" {
  region = "us-east-1"
}

variable "name" {
  default = "roz-aws-config"
}
