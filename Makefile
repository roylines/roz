deploy-sample-bastion:
	cd sample-bastion && terraform init && terraform apply -auto-approve

prepare-node:
	cd roz && npm prune && npm install

deploy-roz:
	cd roz-infra && terraform init && terraform apply -auto-approve

destroy:
	cd roz-infra && terraform destroy -auto-approve
	cd sample-bastion && terraform destroy -auto-approve

all: deploy-sample-bastion prepare-node deploy-roz
