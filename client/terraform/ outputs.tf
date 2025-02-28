output "dev_server_public_ip" {
  description = "Public IP of the Dev server"
  value       = aws_instance.dev_server.public_ip
}

output "qa_server_public_ip" {
  description = "Public IP of the QA server"
  value       = aws_instance.qa_server.public_ip
}

output "private_key_pem" {
  description = "Private key for SSH access"
  value       = tls_private_key.ssh_key.private_key_pem
  sensitive   = true
}