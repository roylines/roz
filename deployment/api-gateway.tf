resource "random_pet" "roz" {
}

resource "aws_api_gateway_rest_api" "roz" {
  name        = "${var.name}-telegram"
  description = "REST api for sending commands"
}

resource "aws_api_gateway_resource" "roz" {
  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
  parent_id   = "${aws_api_gateway_rest_api.roz.root_resource_id}"
  path_part   = "telegram-${random_pet.roz.id}"
}

resource "aws_api_gateway_method" "roz" {
  rest_api_id   = "${aws_api_gateway_rest_api.roz.id}"
  resource_id   = "${aws_api_gateway_resource.roz.id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
  resource_id = "${aws_api_gateway_method.roz.resource_id}"
  http_method = "${aws_api_gateway_method.roz.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri = "${aws_lambda_function.roz.0.invoke_arn}"
}

resource "aws_api_gateway_deployment" "roz" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
  stage_name  = "prod"
}

resource "aws_lambda_permission" "roz" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.roz.0.arn}"
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_deployment.roz.execution_arn}/*/*"
}
/*
data "aws_acm_certificate" "roz" {
  domain   = "*.robopho.be"
  statuses = ["ISSUED"]
}

resource "aws_api_gateway_domain_name" "roz" {
  certificate_arn = "${data.aws_acm_certificate.roz.arn}"
  domain_name     = "roz.robopho.be"
}

resource "aws_api_gateway_base_path_mapping" "test" {
  api_id      = "${aws_api_gateway_rest_api.roz.id}"
  stage_name  = "${aws_api_gateway_deployment.roz.stage_name}"
  domain_name = "${aws_api_gateway_domain_name.roz.domain_name}"
}
*/

