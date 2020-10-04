
# Gitlab managed terraform state uses the http remote terraform state api
terraform {
  backend "http" {
  }
}
