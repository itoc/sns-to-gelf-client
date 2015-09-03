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

export HTTP_LISTEN_PORT=9090            # Values: [Integer 1 - 65535] -- NB: Graylog likes to use 9000 by default.
export GELF_SERVER="127.0.0.1"          # Values: Hostname or IP.
export GELF_SERVER_PORT=12201           # Values: [Integer]
export GELF_CHUNK_SIZE=8154             # Values: [Integer]
export GELF_TRANSPORT_TYPE="lan"        # Values: wan/lan

## SNS Authentication (Suggested if you do not wish to allow messages from any SNS topic!)
export SNS_AUTH="false"                 # Values: true/false.
export SNS_AUTH_REGION=""               # Values: AWS API Region Endpoint (i.e. ap-southeast-2)
export SNS_AWS_ACCOUNT=""               # Values: [Integer] -- Your AWS Account ID
export SNS_TOPIC=""                     # Values: [AWS SNS Toppic Name i.e. arn:aws:sns:us-east-1:123456789012:my-notifications]