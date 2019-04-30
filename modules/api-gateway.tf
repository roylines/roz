// create the REST API resource
resource "aws_api_gateway_rest_api" "roz" {
  name        = "${var.name}-telegram"
  description = "REST api for sending commands"
}

// create a deployment for the API
resource "aws_api_gateway_deployment" "roz" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
}

// create a random pet based id for secret path
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

// point all POSTS to our lambda
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

// create a stage to hang the API off. Auto configure the webhook within telegram
resource "aws_api_gateway_stage" "prod" {
  stage_name    = "production"
  rest_api_id   = "${aws_api_gateway_rest_api.roz.id}"
  deployment_id = "${aws_api_gateway_deployment.roz.id}"

  // configure the webhook in telegram
  provisioner "local-exec" {
    command = "curl -F 'url=${aws_api_gateway_stage.prod.invoke_url}/${aws_api_gateway_resource.roz.path_part}' https://api.telegram.org/bot${var.telegram_token}/setWebhook"
  }

  // unlink the webhook on destroy
  provisioner "local-exec" {
    when    = "destroy"
    command = "curl https://api.telegram.org/bot${var.telegram_token}/deleteWebhook"
  }
}
