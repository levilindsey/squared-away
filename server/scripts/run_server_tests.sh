#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Running server tests"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
mocha --ui bdd --require should --reporter dot apps/home/tests/*.js
mocha --ui bdd --require should --reporter dot apps/wedding/tests/*.js
mocha --ui bdd --require should --reporter dot apps/squaredaway/tests/*.js
