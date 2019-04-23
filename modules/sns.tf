// obtain a reference to the SNS topic
data "aws_sns_topic" "aws_config" {
  name = "${var.name}-aws-config-topic"
}

// create a subscription between the lambda and the topic
resource "aws_sns_topic_subscription" "roz_aws_config" {
  topic_arn = "${data.aws_sns_topic.aws_config.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.roz.arn}"
}
