// create an autoscaling group to manage creation and destruction of the bastion
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
}
