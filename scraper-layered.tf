locals {
  Scraper-layered_srcdir_path     = "${path.module}/scraper-layered"
  Scraper-layered_output_path     = "${path.module}/scraper-layered/scraper-layered.zip"
  sparticuz-chrome-aws-lambda-arn = "arn:aws:lambda:eu-west-2:764866452798:layer:chrome-aws-lambda:31"
}
# AWS Resources ---------------------- START

resource "aws_lambda_permission" "invoke-Scraper-layered" {
  statement_id  = "AllowExecFromScraperAPI"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.Scraper-layered.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ScraperAPI.execution_arn}/*/*/*"
}

data "archive_file" "Scraper-layered-archive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.Scraper-layered_srcdir_path
  output_path      = local.Scraper-layered_output_path
  excludes         = ["mongodb-layer", "scraper-layered.zip", "node_modules"]
}

resource "aws_lambda_function" "Scraper-layered" {
  depends_on = [
    data.archive_file.Scraper-layered-archive,
    aws_cloudwatch_log_group.Scraper-layeredLogs
  ]
  function_name    = "Scraper-layered"
  role             = aws_iam_role.lambda-role.arn
  filename         = "scraper-layered/scraper-layered.zip"
  handler          = "Scraper-layered.Scraper"
  runtime          = "nodejs16.x"
  memory_size      = 2048
  timeout          = 25
  source_code_hash = data.archive_file.Scraper-layered-archive.output_base64sha256
  layers = [
    aws_lambda_layer_version.mongodb-layer.arn,
    local.sparticuz-chrome-aws-lambda-arn,
    "arn:aws:lambda:eu-west-2:822478101782:layer:mongodb-manual:1"
  ]
  ephemeral_storage {
    size = 1024
  }
}

resource "aws_cloudwatch_log_group" "Scraper-layeredLogs" {
  name              = "Scraper-layered"
  retention_in_days = 14
}

