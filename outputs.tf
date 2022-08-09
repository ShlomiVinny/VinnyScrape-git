output "ScraperAPI_endpoint" {
  value     = aws_apigatewayv2_api.ScraperAPI.api_endpoint
  sensitive = false
}

output "VinnyScrape_fill_path" {
  value       = "forms"
  description = "URL in react app into which scraped data should be filled **!IMPORTANT** Also automatically names the <Route> in React **!IMPORTANT**"
  sensitive   = false
}

output "Screenshots_bucket" {
  value     = aws_s3_bucket.vinnyscrape-screenshots.id
  sensitive = false
}

output "Screenshots_bucket_region" {
  value = aws_s3_bucket.vinnyscrape-screenshots.region
}

output "Screenshots_bucket_domain" {
  value     = "https://${aws_s3_bucket.vinnyscrape-screenshots.bucket_domain_name}"
  sensitive = false
}

output "VS_CF_Domain_name" {
  value       = "https://${aws_cloudfront_distribution.vinnyscrape-distro.domain_name}"
  sensitive   = false
  description = "vinnyscrape-distro domain name"
}

output "VS_Cognito_idp_endpoint" {
  value       = aws_cognito_user_pool.VS-userpool.endpoint
  sensitive   = false
  description = "idp endpoint to use with Cognito Identitity Provider, currently unused"
}

output "VS_Cognito_hostedui_queryParams" {
  value = {
    "response_type_param" : "response_type=code",
    "scope_param" : "scope=email+openid",
  }
  description = "End product should look like: https://CF_DOMAIN.auth.eu-west-2.amazoncognito.com/signup?client_id=COGNITO_APPCLIENT_ID&response_type=code&scope=email+openid&redirect_uri=https://CF_DISTRO_DOMAIN"
  sensitive   = true
}

output "VS_Cognito_userpool_domain_full" {
  value     = "https://${aws_cognito_user_pool_domain.VS-userpool-domain.domain}.auth.eu-west-2.amazoncognito.com"
  sensitive = true
}

output "VS_Cognito_userpool_domain_raw" {
  value     = aws_cognito_user_pool_domain.VS-userpool-domain.domain
  sensitive = false
}

output "VS_Cognito_userpool_client_id" {
  value     = aws_cognito_user_pool_client.VS-userpool-client.id
  sensitive = true
}

output "VS_Cognito_userpool_client_secret" {
  value     = aws_cognito_user_pool_client.VS-userpool-client.client_secret
  sensitive = true
}

output "ScraperAPI_users_routekey" {
  value = aws_apigatewayv2_route.users.route_key
}

output "ScraperAPI_verifyuser_routekey" {
  value = aws_apigatewayv2_route.users-verify.route_key
}

output "ScraperAPI_renewtoken_routekey" {
  value = aws_apigatewayv2_route.users-renew.route_key
}

output "ScraperAPI_user_header" {
  value = {
    header : local.allow_user_header,
    recommended_value : aws_iam_user.s3GetObjectUser.name
  }
  sensitive = false
}

output "mongodb-layer-archive_output_path" {
  value = data.archive_file.mongodb-layer-archive.output_path
}

output "DAL_function_name" {
  value = aws_lambda_function.DAL.function_name
}