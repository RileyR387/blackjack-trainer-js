#!/bin/bash

test -d src/resources || mkdir src/resources
cd src/resources
ln -s ../../node_modules/jquery/dist/ jquery
ln -s ../../node_modules/popper.js/dist/ popper
ln -s ../../node_modules/bootstrap/dist bootstrap
ln -s ../../node_modules/angular angular

