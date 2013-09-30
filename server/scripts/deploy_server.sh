#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Deploying server to Nodejitsu"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
jitsu deploy
