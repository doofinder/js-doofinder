#!/bin/bash

type jq >/dev/null 2>&1 || { echo >&2 "jq is required but it's not installed.  Aborting."; exit 1; }

case "$1" in
  major) RELEASE_TYPE_PARAM="--major" ;;
  minor) RELEASE_TYPE_PARAM="--minor" ;;
  patch) RELEASE_TYPE_PARAM="--patch" ;;
  *)
    echo >&2 "invalid release type (only 'patch', 'minor' and 'major' are valid). Aborting.";
    exit 2;
    ;;
esac

# get current version from package.json without quotes
CURRENT_VERSION=`jq -r '.version' package.json`;
# update version in package.json but don't commit
yarn version $RELEASE_TYPE_PARAM --no-git-tag-version;
# get updated version from package.json without quotes
NEW_VERSION=`jq -r '.version' package.json`;
# replace old version by the new one in index
sed -i "" -E "s/$CURRENT_VERSION/$NEW_VERSION/g" src/index.ts;
