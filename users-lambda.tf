locals {
  users_srcdir_path  = "${path.module}/users"
  users_output_path  = "${path.module}/users/users.zip"
  layer1_output_path = "${path.module}/users/layer1.zip"

}
# AWS Resources ---------------------- START

resource "aws_lambda_permission" "invoke-users" {
  statement_id  = "AllowExecFromScraperAPI"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.users.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ScraperAPI.execution_arn}/*/*/*"
}

data "archive_file" "usersArchive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.users_srcdir_path
  output_path      = local.users_output_path
  excludes         = ["users.zip", "node_modules", "layer1.zip", "nodejs", "prepare-layer.bat"]
}

resource "aws_lambda_function" "users" {
  depends_on = [
    data.archive_file.usersArchive,
    aws_cloudwatch_log_group.usersLogs
  ]
  function_name    = "users"
  role             = aws_iam_role.lambda-role.arn
  filename         = "users/users.zip"
  handler          = "users.default"
  runtime          = "nodejs16.x"
  memory_size      = 256
  timeout          = 15
  source_code_hash = data.archive_file.usersArchive.output_base64sha256
  layers           = [aws_lambda_layer_version.users-node-modules.arn]
  environment {
    variables = {
      var1 = "value1"
    }
  }
}

// Layer 1
data "archive_file" "layer1Archive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.users_srcdir_path
  output_path      = local.layer1_output_path
  excludes         = ["users.zip", "package.json", "package-lock.json", "users.mjs", "outputs.json", "layer1.zip", "node_modules", "prepare-layer.bat"]
}

resource "aws_lambda_layer_version" "users-node-modules" {
  depends_on = [
    data.archive_file.layer1Archive
  ]
  description              = "layer for users/node_modules which includes: node-fetch and its' deps ONLY for now"
  layer_name               = "users-node-modules"
  filename                 = data.archive_file.layer1Archive.output_path
  compatible_runtimes      = ["nodejs16.x"]
  compatible_architectures = ["x86_64"]
  source_code_hash         = data.archive_file.layer1Archive.output_base64sha256
}
