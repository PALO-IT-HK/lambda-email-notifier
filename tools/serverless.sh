#!/bin/bash

mkdir .tmp

# Copy package.json and strip out unnecessary information
json out -e 'this.out = JSON.stringify({
  name: this.name,
  version: this.version,
  dependencies: this.dependencies
})' < package.json | json > .tmp/package.json

cp -rp api .tmp/
cp serverless.yml .tmp/

(cd .tmp && npm install --production && serverless "$@")
