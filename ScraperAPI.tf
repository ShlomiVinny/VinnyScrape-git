locals {
  dev_server_origin   = "http://localhost:3000"
  scraperAPI_name     = "ScraperAPI"
  scraperAPI_protocol = "HTTP"
  # output is dependant upon this value do not remove! Or chage outputs.tf accordingly!!!
  allow_path_header  = "vinnyscrape-path"
  allow_user_header  = "x-vs-user"
  allow_auth_header1 = "x-vs-auth-code"
  allow_auth_header2 = "x-vs-redirect-uri"
  allow_auth_header3 = "x-vs-auth-action"
  # 
  allow_headers = [
    "Authorization",
    "Content-Type",
    local.allow_path_header,
    local.allow_user_header,
    local.allow_auth_header1,
    local.allow_auth_header2,
    local.allow_auth_header3,
  ]
  allow_methods      = ["GET", "POST"]
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_api" "ScraperAPI" {
  depends_on = [
    # aws_s3_bucket_website_configuration.VSWsConf
  ]
  name          = local.scraperAPI_name
  protocol_type = local.scraperAPI_protocol
  target        = aws_lambda_function.HTTPHandler.arn
  route_key     = "GET /scrape"
  cors_configuration {
    allow_origins = [
      local.dev_server_origin,
      "https://${aws_cloudfront_distribution.vinnyscrape-distro.domain_name}"
    ]
    allow_credentials = false
    max_age           = 86400
    allow_headers     = local.allow_headers
    allow_methods     = local.allow_methods
  }
}

resource "aws_apigatewayv2_integration" "HTTPHandler-Integration" {
  api_id                 = aws_apigatewayv2_api.ScraperAPI.id
  integration_type       = local.integration_type
  integration_method     = local.integration_method
  integration_uri        = aws_lambda_function.HTTPHandler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "Users-Integration" {
  api_id                 = aws_apigatewayv2_api.ScraperAPI.id
  integration_type       = local.integration_type
  integration_method     = local.integration_method
  integration_uri        = aws_lambda_function.users.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "DAL-Integration" {
  api_id                 = aws_apigatewayv2_api.ScraperAPI.id
  integration_type       = local.integration_type
  integration_method     = local.integration_method
  integration_uri        = aws_lambda_function.DAL.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_cloudwatch_log_group" "ScraperAPI-Logs" {
  name              = "ScraperAPI-Logs"
  retention_in_days = 7
}

resource "aws_apigatewayv2_route" "scrape-layered" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "GET /scrape/layered"
  target    = "integrations/${aws_apigatewayv2_integration.HTTPHandler-Integration.id}"
}

resource "aws_apigatewayv2_route" "validate" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "POST /validate"
  target    = "integrations/${aws_apigatewayv2_integration.HTTPHandler-Integration.id}"
}

resource "aws_apigatewayv2_route" "users" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "GET /users"
  target    = "integrations/${aws_apigatewayv2_integration.Users-Integration.id}"
}

resource "aws_apigatewayv2_route" "users-verify" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "POST /users/verify"
  target    = "integrations/${aws_apigatewayv2_integration.Users-Integration.id}"
}

resource "aws_apigatewayv2_route" "users-renew" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "POST /users/renew"
  target    = "integrations/${aws_apigatewayv2_integration.Users-Integration.id}"
}

resource "aws_apigatewayv2_route" "invoice-module" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "GET /invoice-module"
  target    = "integrations/${aws_apigatewayv2_integration.DAL-Integration.id}"
}

resource "aws_apigatewayv2_route" "table-module" {
  api_id    = aws_apigatewayv2_api.ScraperAPI.id
  route_key = "GET /table-module"
  target    = "integrations/${aws_apigatewayv2_integration.DAL-Integration.id}"
}