#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Starting server with browser-based debugging (http://localhost:8080)"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
node-inspector & && node --debug-brk index.js && chromium --new-window http://localhost:8080 &
