data "aws_caller_identity" "this" {}

data "aws_ecr_authorization_token" "token" {
  registry_id = aws_ecr_repository.scraper-repo.registry_id
}

locals {
  account_id             = data.aws_caller_identity.this.account_id
  repo_name              = "scraper-repo"
  image_tag              = "latest"
  scraperJS_loc          = "./scraper-dkr/Scraper.js"
  scraperPackage_loc     = "./scraper-dkr/package.json"
  scraperPackageLock_loc = "./scraper-dkr/package-lock.json"
  dockerfile_loc         = "./scraper-dkr/Dockerfile"
  outputs_file           = "./scraper-dkr/outputs.json"
  proxy_endpoint         = data.aws_ecr_authorization_token.token.proxy_endpoint
  username               = data.aws_ecr_authorization_token.token.user_name
  auth_region            = data.aws_ecr_authorization_token.token.id
}

resource "aws_ecr_repository" "scraper-repo" {
  name = local.repo_name
}

resource "null_resource" "local-image" {
  triggers = {
    js_file          = filemd5(local.scraperJS_loc)
    package_file     = filemd5(local.scraperPackage_loc)
    packageLock_file = filemd5(local.scraperPackageLock_loc)
    docker_file      = filemd5(local.dockerfile_loc)
    outputs_file     = filemd5(local.outputs_file)
  }
  # *IMPORTANT!* REMEMBER TO UPDATE PATHS IN SCRIPTS!!!!!!!!!!!!!! *************** FFS VINNY!! **********
  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    # ARGS: 1=proxy  2=username  3=repo url  4=image tag
    command = "./Scripts/dockerBuild.bat ${local.proxy_endpoint} ${local.username} ${aws_ecr_repository.scraper-repo.repository_url} ${local.image_tag}"
  }
  depends_on = [
    data.aws_ecr_authorization_token.token,
    aws_ecr_repository.scraper-repo
  ]
}

data "aws_ecr_image" "scraper-image" {
  depends_on = [
    null_resource.local-image
  ]
  repository_name = local.repo_name
  image_tag       = local.image_tag
}

resource "aws_lambda_function" "Scraper" {
  depends_on = [
    null_resource.local-image,
    # aws_cloudwatch_log_group.ScraperLogs
  ]
  function_name = "Scraper"
  role          = aws_iam_role.lambda-role.arn
  image_uri     = "${aws_ecr_repository.scraper-repo.repository_url}@${data.aws_ecr_image.scraper-image.id}"
  package_type  = "Image"
  description   = "Scraper lambda function"
  memory_size   = 2048
  timeout       = 20
  ephemeral_storage {
    size = 1024
  }
}

resource "aws_lambda_permission" "invoke-Scraper" {
  statement_id  = "AllowExecFromHTTPHandler"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.Scraper.function_name
  principal     = "lambda.amazonaws.com"
  source_arn    = "${aws_lambda_function.HTTPHandler.arn}/*/*/*"
}

# resource "aws_cloudwatch_log_group" "ScraperLogs" {
#   name              = "Scraper"
#   retention_in_days = 14
# }
