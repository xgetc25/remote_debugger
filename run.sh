#!/bin/sh


PLATFORM=`uname -s`

if [ $PLATFORM = "Linux" ]; then
	./bin_linux/nw  ./app
elif [ $PLATFORM = "FreeBSD" ]; then
  echo "NO SUPPORT"
elif [ $PLATFORM = "Darwin" ]; then
	./bin_mac/node-webkit.app/Contents/MacOS/node-webkit  ./app
else
  echo "The $PLATFORM platform is not currently supported."
  exit 2
fi