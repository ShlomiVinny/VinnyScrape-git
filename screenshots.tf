resource "aws_s3_bucket" "vinnyscrape-screenshots" {
  bucket = "vinnyscrape-screenshots"
}

resource "aws_s3_bucket_ownership_controls" "vinnyscrape-screenshots-ownership" {
  bucket = aws_s3_bucket.vinnyscrape-screenshots.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_policy" "screenshotsPolicy" {
  bucket = aws_s3_bucket.vinnyscrape-screenshots.id
  policy = data.aws_iam_policy_document.screenshotsPolicyDoc.json
}

data "aws_iam_policy_document" "screenshotsPolicyDoc" {
  depends_on = [
    aws_s3_bucket.vinnyscrape-screenshots
  ]
  statement {
    sid = "vinnyscrapescreenshotspermissions"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
      "s3:DeleteObject"
    ]
    resources = ["${aws_s3_bucket.vinnyscrape-screenshots.arn}/*", aws_s3_bucket.vinnyscrape-screenshots.arn]
  }
}
# ALWAYS HAVE BOTH <ARN> AND <ARN/*> WHEN USING BOTH BUCKET AND OBJECT ACTIONS! Im such a genius... :D

resource "aws_s3_bucket_cors_configuration" "screenshots-cors-config" {
  bucket = aws_s3_bucket.vinnyscrape-screenshots.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = [
      "POST",
      "GET",
      "DELETE",
      "PUT"
    ]
    allowed_origins = [
      "http://www.vinny-scrape.s3-website.eu-west-2.amazonaws.com",
      "*"
    ]
    expose_headers = []
  }
}
