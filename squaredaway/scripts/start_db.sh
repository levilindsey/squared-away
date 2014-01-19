#!/bin/bash

BASE_DIR=`dirname $0`/..

echo ""
echo "Starting MongoDB"
echo "-------------------------------------------------------------------"

cd $BASE_DIR
sudo /etc/init.d/mongodb start
