output "public_ip" {
  value = aws_instance.frontend_server.public_ip
}

output "private_key_pem" {
  value     = tls_private_key.ssh_key.private_key_pem
  sensitive = true
}