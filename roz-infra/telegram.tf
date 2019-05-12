// create a random pet based id for pseudo-secret path
resource "random_pet" "roz" {}

// create a REST resource with a pseudo-secret path
resource "aws_api_gateway_resource" "roz" {
  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
  parent_id   = "${aws_api_gateway_rest_api.roz.root_resource_id}"
  path_part   = "telegram-${random_pet.roz.id}"
}

// create a REST method for POST to the path
resource "aws_api_gateway_method" "roz" {
  rest_api_id   = "${aws_api_gateway_rest_api.roz.id}"
  resource_id   = "${aws_api_gateway_resource.roz.id}"
  http_method   = "POST"
  authorization = "NONE"
}

// point the REST method to our lambda
resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
  resource_id = "${aws_api_gateway_method.roz.resource_id}"
  http_method = "${aws_api_gateway_method.roz.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.roz.0.invoke_arn}"
}

// allow the lambda to be invoked by API gateway
resource "aws_lambda_permission" "roz" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.roz.arn}"
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_deployment.roz.execution_arn}*/*"
}
