resource "aws_cloudwatch_event_rule" "every" {
  name                = "${var.name}"
  description         = "Calls roz on an increment"
  schedule_expression = "rate(2 minutes)"
}

resource "aws_cloudwatch_event_target" "roz" {
  rule      = "${aws_cloudwatch_event_rule.every.name}"
  target_id = "${var.name}"
  arn       = "${aws_lambda_function.roz.arn}"
}

resource "aws_lambda_permission" "roz_schedule" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.roz.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.every.arn}"
}
