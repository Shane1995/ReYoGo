#!/usr/bin/env bash
set -euo pipefail

TAG_PREFIX="${1:?Usage: semver-bump.sh <tag-prefix>}"

LATEST=$(git tag -l "${TAG_PREFIX}/v[0-9]*" --sort=-v:refname | head -1)
if [ -z "$LATEST" ]; then
  BASE="0.0.0"
  RANGE="HEAD"
else
  BASE=$(echo "$LATEST" | sed "s|^${TAG_PREFIX}/v||")
  RANGE="${LATEST}..HEAD"
fi

COMMITS=$(git log "$RANGE" --pretty=format:"%s" 2>/dev/null || true)

if [ -z "$COMMITS" ]; then
  echo "bump=skip" >> "$GITHUB_OUTPUT"
  echo "No commits since last tag"
  exit 0
fi

BUMP="skip"

while IFS= read -r MSG; do
  if echo "$MSG" | grep -qiE 'BREAKING[ -]CHANGE|^[a-z]+(\(.+\))?!:'; then
    BUMP="major"
    break
  fi

  TYPE=$(echo "$MSG" | grep -oE '^[a-z]+' | head -1)

  case "$TYPE" in
    feat)
      if [ "$BUMP" != "major" ]; then
        BUMP="minor"
      fi
      ;;
    fix|refactor|perf|style)
      if [ "$BUMP" = "skip" ]; then
        BUMP="patch"
      fi
      ;;
  esac
done <<< "$COMMITS"

if [ "$BUMP" = "skip" ]; then
  echo "bump=skip" >> "$GITHUB_OUTPUT"
  echo "No releasable commits (chore/docs/ci/test only)"
  exit 0
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE"
case "$BUMP" in
  major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
  minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
  patch) PATCH=$((PATCH + 1)) ;;
esac

VERSION="$MAJOR.$MINOR.$PATCH"
TAG="${TAG_PREFIX}/v${VERSION}"

echo "bump=$BUMP" >> "$GITHUB_OUTPUT"
echo "version=$VERSION" >> "$GITHUB_OUTPUT"
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "$BUMP bump → $TAG"
