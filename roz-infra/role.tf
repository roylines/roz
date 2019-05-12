// create assumed role for lambda
data "aws_iam_policy_document" "assume" {
  policy_id = "${local.name}-assume"

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
  name               = "${local.name}"
  assume_role_policy = "${data.aws_iam_policy_document.assume.json}"
}

// attach the policy to the role
resource "aws_iam_role_policy_attachment" "roz" {
  role       = "${aws_iam_role.roz.name}"
  policy_arn = "${aws_iam_policy.roz.arn}"
}
