deploy-sample-bastion:
	cd sample-bastion && terraform init && terraform apply -auto-approve

prepare-node:
	cd roz && npm prune && npm install

deploy-roz:
	cd roz-infra && terraform init && terraform apply -auto-approve

all: deploy-sample-bastion prepare-node deploy-roz
