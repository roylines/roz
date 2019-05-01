// set up the AWS provider
provider "aws" {
  region = "us-east-1"
}

// use this variable to scope everything
variable "name" {
  description = "name to be used to scope all resources under"
}

// this will be used to configure SSH
variable "public_key" {
  description = "public key to use for ssh access to bastion"
}
