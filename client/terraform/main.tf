provider "aws" {
  region = "us-east-1"  # Directly specifying AWS region
}

# ✅ Generate SSH Key (For EC2 Access)
resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# ✅ Store Public Key in AWS as a Key Pair
resource "aws_key_pair" "generated_key" {
  key_name   = "jenkins-key"  # Directly specifying key name
  public_key = tls_private_key.ssh_key.public_key_openssh
}

# ✅ Create Security Group (Fix Missing Reference)
resource "aws_security_group" "allow_all" {
  name        = "allow-all"
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

# ✅ Create EC2 Instance for Dev Server
resource "aws_instance" "dev_server" {
  ami             = "ami-04b4f1a9cf54c11d0"  # Directly specifying AMI ID
  instance_type   = "t2.micro"  # Free-tier eligible
  key_name        = aws_key_pair.generated_key.key_name
  security_groups = [aws_security_group.allow_all.name]

  tags = {
    Name = "Dev-HouseHunt"
    Environment = "Development"
  }
}

# ✅ Create EC2 Instance for QA Server
resource "aws_instance" "qa_server" {
  ami             = "ami-04b4f1a9cf54c11d0"  # Directly specifying AMI ID
  instance_type   = "t2.micro"  # Free-tier eligible
  key_name        = aws_key_pair.generated_key.key_name
  security_groups = [aws_security_group.allow_all.name]

  tags = {
    Name = "QA-HouseHunt"
    Environment = "QA"
  }
}

# ✅ Store the Private Key for SSH Access
resource "local_file" "private_key" {
  content  = tls_private_key.ssh_key.private_key_pem
  filename = "jenkins-key.pem"
}

# ✅ Output Public IPs for Dev & QA Servers
output "dev_server_public_ip" {
  description = "Public IP of the Dev server"
  value       = aws_instance.dev_server.public_ip
}

output "qa_server_public_ip" {
  description = "Public IP of the QA server"
  value       = aws_instance.qa_server.public_ip
}