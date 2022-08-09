locals {
  httphandler_srcfile_path = "./http-handler/httphandler.js"
  httphandler_output_path  = "./http-handler/httphandler.zip"
}

resource "aws_lambda_permission" "invoke-HTTPHandler" {
  statement_id  = "AllowExecFromScraperAPI"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.HTTPHandler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ScraperAPI.execution_arn}/*/*/*"
}

data "archive_file" "HTTPHandlerArchive" {
  type             = "zip"
  output_file_mode = "0666"
  source_file      = local.httphandler_srcfile_path
  output_path      = local.httphandler_output_path
}

resource "aws_lambda_function" "HTTPHandler" {
  depends_on = [
    data.archive_file.HTTPHandlerArchive
  ]
  function_name    = "HTTPHandler"
  role             = aws_iam_role.lambda-role.arn
  filename         = "http-handler/httphandler.zip"
  handler          = "httphandler.HTTPHandler"
  runtime          = "nodejs16.x"
  memory_size      = 256
  timeout          = 30
  source_code_hash = data.archive_file.HTTPHandlerArchive.output_base64sha256
  environment {
    variables = {
      Scraper        = aws_lambda_function.Scraper.function_name
      ScraperLayered = aws_lambda_function.Scraper-layered.function_name
      bucketName     = aws_s3_bucket.vinnyscrape-screenshots.id
    }
  }
}
