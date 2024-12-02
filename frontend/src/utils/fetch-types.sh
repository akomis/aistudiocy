#!/bin/bash

SOURCE_DIR="../strapi"
DEST_DIR="./src"

# Transfrom module to namespace to fix typescript error
sed -i 's/export module Public/export namespace Public/g' "$SOURCE_DIR/types/generated/contentTypes.d.ts"

# Copy the contents from source to destination
cp -r "$SOURCE_DIR/types/generated" "$DEST_DIR/types"