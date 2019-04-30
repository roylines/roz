.PHONY: package plan deploy

package:
	parcel build ./index.js --target node --global handler --bundle-node-modules --no-source-maps --no-minify --out-dir modules --out-file lambda.js

plan: package
	terraform init
	terraform plan -out=terraform.plan

deploy: plan
	terraform apply -auto-approve terraform.plan

simulate-break-glass:
	docker run --rm -v "$PWD":/var/task lambci/lambda:nodejs8.10 index.handler '{"message_id":103,"chat":{"id":594734320,"first_name":"Mike","last_name":"Woz","username":"woz","type":"private"},"date":1556519621,"text":"break glass"}'

