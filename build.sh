#!/bin/sh

cat src/index.html | sed "s/TIME_UPDATED/$(date)/;" > docs/index.html
