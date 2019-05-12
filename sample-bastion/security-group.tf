// add a security group allowing 22 over TCP
resource "aws_security_group" "bastion" {
  name        = "${var.name}-bastion"
  description = "security group used for bastion servers"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = 6             // TCP
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
