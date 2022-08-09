locals {
  DAL_srcdir_path    = "./DAL"
  DAL_output_path = "./DAL/DAL.zip"
  DAL-layer_output_path = "${path.module}/DAL/DAL-layer.zip"
}

resource "aws_lambda_permission" "invoke-DAL" {
  statement_id  = "AllowExecFromScraperAPI"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.DAL.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ScraperAPI.execution_arn}/*/*/*"
}

data "archive_file" "DALArchive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.DAL_srcdir_path
  output_path      = local.DAL_output_path
  excludes         = ["DAL.zip", "node_modules", "DAL-layer.zip", "nodejs", "prepare-layer.bat"]
}

resource "aws_lambda_function" "DAL" {
  depends_on = [
    data.archive_file.DALArchive
  ]
  function_name    = "DAL"
  role             = aws_iam_role.lambda-role.arn
  filename         = "DAL/DAL.zip"
  handler          = "DAL.DAL"
  runtime          = "nodejs16.x"
  memory_size      = 1024
  timeout          = 15
  source_code_hash = data.archive_file.DALArchive.output_base64sha256
  environment {
    variables = {
      VS_MONGO_URI = "mongodb+srv://vinnyscrape:Zbg4dpwbtJvX3l6H@vinnyscrapecluster.kjnaczt.mongodb.net/?retryWrites=true&w=majority"
    }
  }
}

data "archive_file" "dal-layer-archive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.DAL_srcdir_path
  output_path      = local.DAL-layer_output_path
  excludes         = ["DAL.zip", "package.json", "package-lock.json", "DAL.js", "outputs.json", "DAL-layer.zip", "node_modules", "prepare-layer.bat"]
}

resource "aws_lambda_layer_version" "dal-node-modules" {
  depends_on = [
    data.archive_file.dal-layer-archive
  ]
  description              = "layer for dal/node_modules which includes: node-fetch and aws-sdk"
  layer_name               = "dal-node-modules"
  filename                 = data.archive_file.dal-layer-archive.output_path
  compatible_runtimes      = ["nodejs16.x"]
  compatible_architectures = ["x86_64"]
  source_code_hash         = data.archive_file.dal-layer-archive.output_base64sha256
}

