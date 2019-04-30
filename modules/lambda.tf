// create assumed role for lambda
data "aws_iam_policy_document" "assume" {
  policy_id = "${var.name}-assume"

  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com",
      ]
    }
  }
}

// create a role for the lambda to run under
resource "aws_iam_role" "roz" {
  name               = "${var.name}"
  assume_role_policy = "${data.aws_iam_policy_document.assume.json}"
}

// create a policy document for iam permissions for the lambda
data "aws_iam_policy_document" "roz" {
  policy_id = "${var.name}"

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
      "autoscaling:SetDesiredCapacity"
    ]

    effect    = "Allow"
    resources = ["${aws_autoscaling_group.bastion.arn}"]
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
      "arn:aws:lambda:*:*:function:${var.name}",
    ]
  }
}

// create the policy
resource "aws_iam_policy" "roz" {
  name   = "${var.name}"
  policy = "${data.aws_iam_policy_document.roz.json}"
}

// attach the policy to the role
resource "aws_iam_role_policy_attachment" "roz" {
  role       = "${aws_iam_role.roz.name}"
  policy_arn = "${aws_iam_policy.roz.arn}"
}

// archive the bundled lambda javascript file
data "archive_file" "roz" {
  type        = "zip"
  source_file = "${path.module}/lambda.js"
  output_path = "${path.module}/lambda.zip"
}

// create the lambda
resource "aws_lambda_function" "roz" {
  function_name                  = "${var.name}"
  filename                       = "${data.archive_file.roz.output_path}"
  role                           = "${aws_iam_role.roz.arn}"
  handler                        = "lambda.handler"
  source_code_hash               = "${data.archive_file.roz.output_base64sha256}"
  runtime                        = "nodejs8.10"
  timeout                        = "900"
  memory_size                    = "256"
  reserved_concurrent_executions = 1

  environment = {
    variables = {
      TELEGRAM_TOKEN             = "${var.telegram_token}"
      TELEGRAM_USER              = "${var.telegram_user}"
      BASTION_AUTO_SCALING_GROUP = "${aws_autoscaling_group.bastion.name}"
    }
  }
}
