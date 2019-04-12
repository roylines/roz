// create the policy document for the configuration recorder
data "aws_iam_policy_document" "aws_config" {
  policy_id = "${var.name}"

  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["config.amazonaws.com"]
    }
  }
}

// set up an sns topic for notifications 
resource "aws_sns_topic" "aws_config" {
  name = "${var.name}-topic"
}

// create the role for the configuration recorder
resource "aws_iam_role" "aws_config" {
  name               = "${var.name}"
  assume_role_policy = "${data.aws_iam_policy_document.aws_config.json}"
}

// create the policy document for notifying the sns topic
data "aws_iam_policy_document" "aws_config_sns" {
  policy_id = "${var.name}-sns"

  statement {
    effect    = "Allow"
    actions   = ["sns:Publish"]
    resources = ["${aws_sns_topic.aws_config.arn}"]
  }
}

resource "aws_iam_policy" "aws_config_sns" {
  name   = "${data.aws_iam_policy_document.aws_config_sns.id}"
  policy = "${data.aws_iam_policy_document.aws_config_sns.json}"
}

// add the policy document for notifying the sns topic
resource "aws_iam_role_policy_attachment" "aws_config_sns" {
  role       = "${aws_iam_role.aws_config.name}"
  policy_arn = "${aws_iam_policy.aws_config_sns.arn}"
}

// add the AWS managed role to grant access to resources
resource "aws_iam_role_policy_attachment" "aws_config_resources" {
  role       = "${aws_iam_role.aws_config.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSConfigRole"
}

// creat the configuration recorder
resource "aws_config_configuration_recorder" "aws_config" {
  name     = "${var.name}"
  role_arn = "${aws_iam_role.aws_config.arn}"

  recording_group {
    all_supported                 = false
    include_global_resource_types = false
    resource_types                = ["AWS::EC2::SecurityGroup"]
  }
}

// create a delivery channel for all recordings
resource "aws_config_delivery_channel" "aws_config" {
  name           = "${aws_config_configuration_recorder.aws_config.name}"
  s3_bucket_name = "${aws_s3_bucket.aws_config.bucket}"
  sns_topic_arn  = "${aws_sns_topic.aws_config.arn}"
  depends_on     = ["aws_config_configuration_recorder.aws_config"]
}

// enable the recorder
resource "aws_config_configuration_recorder_status" "aws_config" {
  name       = "${aws_config_configuration_recorder.aws_config.name}"
  is_enabled = true
  depends_on = ["aws_config_delivery_channel.aws_config"]
}
