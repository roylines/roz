//  
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

  tags = {
    Name = "${var.name}-bastion"
  }
}

resource "aws_launch_template" "bastion" {
  name_prefix          = "${var.name}-bastion"
  image_id             = "${data.aws_ami.latest.id}"
  instance_type        = "t2.nano"
  security_group_names = ["${aws_security_group.bastion.name}"]
  key_name             = "${aws_key_pair.roz.key_name}"

  tags = {
    Name = "${var.name}-bastion"
  }
}

resource "aws_autoscaling_group" "bastion" {
  name               = "${var.name}-bastion"
  availability_zones = ["us-east-1a"]
  desired_capacity   = 0
  max_size           = 1
  min_size           = 0

  launch_template {
    id      = "${aws_launch_template.bastion.id}"
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.name}-bastion"
    propagate_at_launch = false
  }
}
