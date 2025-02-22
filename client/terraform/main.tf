provider "aws" {
  region = var.aws_region
}

# ✅ Generate SSH Key (For EC2 Access)
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# ✅ Store Public Key in AWS as a Key Pair
resource "aws_key_pair" "generated_key" {
  key_name   = var.key_name
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# ✅ Create Security Group (Fix Missing Reference)
resource "aws_security_group" "allow_all" {
  name        = var.security_group_name
  description = "Allow SSH and HTTP access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ✅ Fix: Use `aws_security_group.allow_all.name` Instead of `var.security_group`
resource "aws_instance" "frontend_server" {
  ami             = var.ami_id
  instance_type   = var.instance_type
  key_name        = aws_key_pair.generated_key.key_name
  security_groups = [aws_security_group.allow_all.name]

  tags = {
    Name = "HouseHunt-Frontend-Server"
  }
}

# ✅ Store the Private Key for SSH Access
resource "local_file" "private_key" {
  content  = tls_private_key.ssh_key.private_key_pem
  filename = "jenkins-key.pem"
}