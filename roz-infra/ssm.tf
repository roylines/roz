resource "aws_ssm_parameter" "telegram_token" {
  name        = "${local.name}-telegram-token"
  description = "telegram token"
  type        = "SecureString"
  value       = "${var.telegram_token}"
}

resource "aws_ssm_parameter" "telegram_user" {
  name        = "${local.name}-telegram-user"
  description = "telegram user"
  type        = "SecureString"
  value       = "${var.telegram_user}"
}

resource "aws_ssm_parameter" "initialised" {
  name        = "${local.name}-initialised"
  description = "initialisation state"
  type        = "String"
  value       = "false"
}
