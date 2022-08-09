resource "aws_iam_user" "s3GetObjectUser" {
  name = "s3GetObjectUser"
}

resource "aws_iam_access_key" "s3GetObjectUserCredentials" {
  user = aws_iam_user.s3GetObjectUser.name
}

resource "aws_iam_user_policy" "s3GetObjectUserPolicy" {
  name = "s3GetObjectUserPolicy"
  user = aws_iam_user.s3GetObjectUser.name
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Sid" : "s3GetObject235346gfdfg",
        "Effect" : "Allow",
        "Action" : [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        "Resource" : [
          "arn:aws:s3:::vinnyscrape-screenshots/screenshots/*",
          "arn:aws:s3:::vinnyscrape-screenshots/screenshots"
        ]
      }
    ]
  })
}
