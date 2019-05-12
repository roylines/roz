// pull in the bastion
data "aws_autoscaling_group" "bastion" {
  name = "roz-bastion"
}

// create a policy document for iam permissions for the lambda
data "aws_iam_policy_document" "roz" {
  policy_id = "${local.name}"

  // to store logs
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    effect = "Allow"

    resources = [
      "arn:aws:logs:*:*:*",
    ]
  }

  // to set desired capacity
  statement {
    actions = [
      "autoscaling:SetDesiredCapacity",
    ]

    effect    = "Allow"
    resources = ["${data.aws_autoscaling_group.bastion.arn}"]
  }

  // to check capacity
  statement {
    actions = [
      "autoscaling:DescribeAutoScalingGroups",
    ]

    effect    = "Allow"
    resources = ["*"]
  }

  // to obtain ipaddresses of bastion
  statement {
    actions = [
      "ec2:DescribeInstances",
    ]

    effect    = "Allow"
    resources = ["*"]
  }

  // to invoke self recursively
  statement {
    actions = ["lambda:InvokeFunction"]
    effect  = "Allow"

    resources = [
      "arn:aws:lambda:*:*:function:${local.name}",
    ]
  }
}

// create the policy
resource "aws_iam_policy" "roz" {
  name   = "${local.name}"
  policy = "${data.aws_iam_policy_document.roz.json}"
}
