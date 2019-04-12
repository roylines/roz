// create a bucket for the configuration recorder to write to
resource "aws_s3_bucket" "aws_config" {
  bucket_prefix = "${var.name}"
  acl           = "private"
  force_destroy = "true"
}

// create the policy document for the configuration bucket
data "aws_iam_policy_document" "aws_config_bucket" {
  policy_id = "${var.name}-bucket"

  statement {
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.aws_config.arn}/AWSLogs/*/*"]

    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }

  statement {
    actions = ["s3:GetBucketAcl"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }

    resources = [
      "${aws_s3_bucket.aws_config.arn}",
    ]
  }
}

// assign the policy to the bucket
resource "aws_s3_bucket_policy" "config_bucket_policy" {
  bucket = "${aws_s3_bucket.aws_config.id}"
  policy = "${data.aws_iam_policy_document.aws_config_bucket.json}"
}
