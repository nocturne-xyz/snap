#!/bin/bash

yarn build
SNAP_BUNDLE_JS="./dist/bundle.js"

LOCAL_RPC_URL="http://127.0.0.1:8545/"
LOCAL_BUNDLER_URL="http://127.0.0.1:3000"
LOCAL_SUBGRAPH_API_URL="http://127.0.0.1:8000/subgraphs/name/nocturne"
LOCAL_CONFIG="localhost"

sed -i '' -r -e "s|const RPC_URL = .*|const RPC_URL = \"$LOCAL_RPC_URL\";|g" $SNAP_BUNDLE_JS
echo "RPC_URL after sed:"
grep "const RPC_URL =" $SNAP_BUNDLE_JS

sed -i '' -r -e "s|const BUNDLER_URL = .*|const BUNDLER_URL = \"$LOCAL_BUNDLER_URL\";|g" $SNAP_BUNDLE_JS
echo "BUNDLER_URL after sed:"
grep "const BUNDLER_URL =" $SNAP_BUNDLE_JS

sed -i '' -r -e "s|const SUBGRAPH_API_URL = .*|const SUBGRAPH_API_URL = \"$LOCAL_SUBGRAPH_API_URL\";|g" $SNAP_BUNDLE_JS
echo "SUBGRAPH_API_URL after sed:"
grep "const SUBGRAPH_API_URL =" $SNAP_BUNDLE_JS

sed -i '' -r -e "s|const config = .*|const config = (0, _config.loadNocturneConfigBuiltin)(\"$LOCAL_CONFIG\");|g" $SNAP_BUNDLE_JS
echo "config after sed:"
grep "(0, _config.loadNocturneConfigBuiltin)" $SNAP_BUNDLE_JS

yarn manifest:fix
