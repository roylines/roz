.PHONY: package plan deploy

package:
	parcel build ./index.js --target node --global handler --bundle-node-modules --no-source-maps --no-minify --out-dir modules --out-file lambda.js

plan: package
	terraform init
	terraform plan -out=terraform.plan

deploy: plan
	terraform apply -auto-approve terraform.plan
