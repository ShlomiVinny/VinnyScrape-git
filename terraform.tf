terraform {
  cloud {
    organization = "VinnyScrape"
    workspaces {
      name = "ScraperWS"
    }
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.19"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.3.1"
    }
  }
}

provider "aws" {
  region = "eu-west-2"
}

provider "mongodbatlas" {
  public_key  = "epejfwux"
  private_key = "0d693d11-f9a1-46ef-b86b-9129798ba36b"
}
