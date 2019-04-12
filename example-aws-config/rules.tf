// check that incoming SSH is disables
resource "aws_config_config_rule" "incoming_ssh_disabled" {
  name = "${var.name}-incoming-ssh-disabled"

  source {
    owner             = "AWS"
    source_identifier = "INCOMING_SSH_DISABLED"
  }

  scope {
    compliance_resource_types = ["AWS::EC2::SecurityGroup"]
  }

  depends_on = ["aws_config_configuration_recorder.aws_config"]
}
