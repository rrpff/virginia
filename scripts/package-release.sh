VERSION=$(cat ./package.json | jq -r .version)
ROOTDIR=$(pwd)
BUNDLEDIR=$ROOTDIR/apps/tray/src-tauri/target/release/bundle/macos

echo "Packaging $VERSION"

echo "\\nCopying bundle from $BUNDLEDIR"
mkdir -p ./releases/$VERSION
cp $BUNDLEDIR/Virginia.app.tar.gz ./releases/$VERSION/Virginia-darwin-aarch64-$VERSION.app.tar.gz

echo "\\nCreating update JSON manifest"
SIGNATURE=$(cat $BUNDLEDIR/Virginia.app.tar.gz.sig)
cat > $ROOTDIR/latest.json << EOF
{
  "version": "$VERSION",
  "notes": "",
  "pub_date": "$(gdate -Iseconds)",
  "platforms": {
    "darwin-aarch64": {
      "signature": "$SIGNATURE",
      "url": "https://github.com/user/repo/releases/latest/download/Virginia-$VERSION.app.tar.gz"
    }
  }
}
EOF

echo "\\nDone!"