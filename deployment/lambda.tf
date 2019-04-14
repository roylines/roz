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

resource "aws_iam_role" "roz" {
  name               = "${var.name}"
  assume_role_policy = "${data.aws_iam_policy_document.assume.json}"
}

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
}

resource "aws_iam_policy" "roz" {
  name   = "${var.name}"
  policy = "${data.aws_iam_policy_document.roz.json}"
}

resource "aws_iam_role_policy_attachment" "roz" {
  role       = "${aws_iam_role.roz.name}"
  policy_arn = "${aws_iam_policy.roz.arn}"
}

data "archive_file" "roz" {
  type        = "zip"
  source_file = "${path.module}/../lambda.js"
  output_path = "${path.module}/../lambda.zip"
}

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
      TELEGRAM_TOKEN = "${var.telegram_token}",
      TELEGRAM_USER = "${var.telegram_user}"
    }
  }
}
