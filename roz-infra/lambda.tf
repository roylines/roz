// package the node modules
resource "null_resource" "roz" {
  // make it run every time
  triggers {
    build_number = "${timestamp()}"
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/../roz"
    command     = "parcel build ./index.js --target node --global handler --bundle-node-modules --no-source-maps --no-minify --out-dir ${path.module} --out-file lambda.js"
  }
}

// archive the bundled lambda javascript file
data "archive_file" "roz" {
  type        = "zip"
  source_file = "${path.module}/lambda.js"
  output_path = "${path.module}/lambda.zip"
  depends_on  = ["null_resource.roz"]
}

// create the lambda
resource "aws_lambda_function" "roz" {
  function_name                  = "${local.name}"
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
      NAME                       = "${local.name}"
      TELEGRAM_TOKEN             = "${var.telegram_token}"
      TELEGRAM_USER              = "${var.telegram_user}"
      BASTION_AUTO_SCALING_GROUP = "${data.aws_autoscaling_group.bastion.name}"
    }
  }
}
