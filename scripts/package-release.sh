VERSION=$(cat ./package.json | jq -r .version)
ROOTDIR=$(pwd)
BUNDLEDIR=$ROOTDIR/apps/tray/src-tauri/target/release/bundle/macos

echo "Packaging $VERSION"

echo "\\nZipping .app release from $BUNDLEDIR"
mkdir -p $ROOTDIR/releases/$VERSION
cd $BUNDLEDIR
zip -r $ROOTDIR/releases/$VERSION/Virginia-darwin-arm64-$VERSION.zip ./Virginia.app
cd $ROOTDIR

echo "\\nCopying updates from $BUNDLEDIR"
cp $BUNDLEDIR/Virginia.app.tar.gz ./releases/$VERSION/Virginia-$VERSION.app.tar.gz
cp $BUNDLEDIR/Virginia.app.tar.gz.sig ./releases/$VERSION/Virginia-$VERSION.app.tar.gz.sig

echo "\\nCreating update JSON manifest"
SIGNATURE=$(cat ./releases/$VERSION/Virginia-$VERSION.app.tar.gz.sig)
cat > $ROOTDIR/releases/$VERSION/latest.json << EOF
{
  "version": "$VERSION",
  "notes": "",
  "pub_date": "",
  "platforms": {
    "darwin-aarch64": {
      "signature": "$SIGNATURE",
      "url": "https://github.com/user/repo/releases/latest/download/Virginia-$VERSION.app.tar.gz"
    }
  }
}
EOF

echo "\\nDone!"