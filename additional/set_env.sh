#!/bin/bash
#
# This program will run as a simple HTTP server allowing SNS to push messages into Graylog via the standardised GELF format
#
# Author:  David Nedved, ITOC.
#          david.nedved@itoc.com.au
#
####################################################
#
# Please change the following configuration options to suit your environment.

export HTTP_LISTEN_PORT=9000
export GELF_SERVER="127.0.0.1"
export GELF_SERVER_PORT=12201
export GELF_CHUNK_SIZE=8154
export GELF_TRANSPORT_TYPE="lan"