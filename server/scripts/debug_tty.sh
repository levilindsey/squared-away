#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Starting server with TTY-based debugging (http://localhost:3000)"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
node debug index.js
