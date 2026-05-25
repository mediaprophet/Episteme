#!/bin/bash
# Shell helper wrapper for just-in-time Episteme rule queries.
node "$(dirname "$0")/agent-loader.js" "$@"
