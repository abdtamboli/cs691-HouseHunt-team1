output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.frontend_server.public_ip
}

output "private_key_pem" {
  description = "Private key for SSH access"
  value       = tls_private_key.ssh_key.private_key_pem
  sensitive   = true
}