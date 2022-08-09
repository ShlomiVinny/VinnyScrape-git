locals {
  mongodb-layer_srcdir_path = "${path.module}/scraper-layered/mongodb-layer"
  mongodb-layer_output_path = "${path.module}/scraper-layered/mongodb-layer/mongodb-layer.zip"
}

data "archive_file" "mongodb-layer-archive" {
  type             = "zip"
  output_file_mode = "0666"
  source_dir       = local.mongodb-layer_srcdir_path
  output_path      = local.mongodb-layer_output_path
  excludes         = ["mongodb-layer.zip", "package.json", "package-lock.json", "node_modules", "prepare-layer.bat"]
}

resource "aws_lambda_layer_version" "mongodb-layer" {
  depends_on = [
    data.archive_file.mongodb-layer-archive
  ]
  description              = "MongoDB package layer - ONLY includes mongodb"
  layer_name               = "mongodb"
  filename                 = data.archive_file.mongodb-layer-archive.output_path
  compatible_runtimes      = ["nodejs16.x"]
  compatible_architectures = ["x86_64"]
  source_code_hash         = data.archive_file.mongodb-layer-archive.output_base64sha256
}
