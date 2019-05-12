// create the REST API resource
resource "aws_api_gateway_rest_api" "roz" {
  name        = "${local.name}"
  description = "REST api for sending commands"
}

// create a deployment for the API
resource "aws_api_gateway_deployment" "roz" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.roz.id}"
}

// create a stage to hang the API off. Auto configure the webhook within telegram
resource "aws_api_gateway_stage" "prod" {
  stage_name    = "production"
  rest_api_id   = "${aws_api_gateway_rest_api.roz.id}"
  deployment_id = "${aws_api_gateway_deployment.roz.id}"

  // configure the webhook in telegram
  provisioner "local-exec" {
    command = "curl -F 'url=${aws_api_gateway_stage.prod.invoke_url}/${aws_api_gateway_resource.roz.path_part}' https://api.telegram.org/bot$TELEGRAM_TOKEN/setWebhook"

    environment = {
      TELEGRAM_TOKEN = "${var.telegram_token}"
    }
  }

  // unlink the webhook on destroy
  provisioner "local-exec" {
    when    = "destroy"
    command = "curl https://api.telegram.org/bot$TELEGRAM_TOKEN/deleteWebhook"

    environment = {
      TELEGRAM_TOKEN = "${var.telegram_token}"
    }
  }
}
