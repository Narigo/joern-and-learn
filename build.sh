#!/bin/sh

mkdir build

cp src/CNAME build/

cat src/index.html | sed "s/TIME_UPDATED/$(date)/;" > build/index.html
