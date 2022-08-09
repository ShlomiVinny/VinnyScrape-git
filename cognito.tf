locals {
}

resource "aws_cognito_user_pool" "VS-userpool" {
  name                     = "vinny-scrape-user-pool"
  alias_attributes         = ["email", "phone_number", "preferred_username"]
  auto_verified_attributes = ["email"]

  email_configuration {
    email_sending_account  = "COGNITO_DEFAULT"
    reply_to_email_address = "vinno1990@gmail.com"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Vinny Scrape - Account Confirmation"
    email_message        = "Hello There! Your confirmation code is {####} Please type that into the login page to complete verification!"
  }

  # --- Schemas: 
  schema {
    name                     = "isNotAHater"
    attribute_data_type      = "Boolean"
    mutable                  = false
    required                 = false
    developer_only_attribute = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }

  admin_create_user_config {
    # Whether or not to allow user self-reg, for "security" reasons i would be confirming users manually
    allow_admin_create_user_only = false
    # Only used if above is set to true
    # invite_message_template {
    #   email_message = "Hello {username} something something, this is your code: {####}"
    #   email_subject = ""
    # }
  }
}

resource "aws_cognito_user_pool_client" "VS-userpool-client" {
  name                                 = "vs-userpool-client"
  user_pool_id                         = aws_cognito_user_pool.VS-userpool.id
  callback_urls                        = ["https://${aws_cloudfront_distribution.vinnyscrape-distro.domain_name}"]
  default_redirect_uri                 = "https://${aws_cloudfront_distribution.vinnyscrape-distro.domain_name}"
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid"]
  supported_identity_providers         = ["COGNITO"]
  generate_secret                      = true
}

resource "aws_cognito_user" "vs-user1" {
  user_pool_id = aws_cognito_user_pool.VS-userpool.id
  username     = "testUser"
  password     = "testUser1!"
  attributes = {
    isNotAHater = false
  }
}

resource "aws_cognito_user" "vs-user2" {
  user_pool_id = aws_cognito_user_pool.VS-userpool.id
  username     = "YoavShotland"
  password     = "Mister!CT0"
  attributes = {
    isNotAHater = true
  }
}

resource "aws_cognito_user_pool_domain" "VS-userpool-domain" {
  domain       = "vinnyscrape"
  user_pool_id = aws_cognito_user_pool.VS-userpool.id
}


# Later...
resource "aws_cognito_user_pool_ui_customization" "VS-userpool-UI" {
  # css = ""
  image_file = filebase64("./react/public/Monto_Logo.png")

  # Refer to the aws_cognito_user_pool_domain resource's
  # user_pool_id attribute to ensure it is in an 'Active' state
  user_pool_id = aws_cognito_user_pool_domain.VS-userpool-domain.user_pool_id
}
