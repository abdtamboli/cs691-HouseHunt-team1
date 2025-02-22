terraform {
  backend "s3" {
    bucket         = "househunt-terraform-state"
    key            = "househunt/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}