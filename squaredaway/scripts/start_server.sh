#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Starting server (http://localhost:3000)"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
node index.js
