// create the key pair for ssh 
resource "aws_key_pair" "roz" {
  key_name   = "${var.name}"
  public_key = "${var.public_key}"
}

// get the latest linux ami
data "aws_ami" "latest" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-hvm-*"]
  }
}

// create a launch template for the bastion ec2 instance
resource "aws_launch_template" "bastion" {
  name_prefix          = "${var.name}-bastion"
  image_id             = "${data.aws_ami.latest.id}"
  instance_type        = "t2.nano"
  security_group_names = ["${aws_security_group.bastion.name}"]
  key_name             = "${aws_key_pair.roz.key_name}"
}
