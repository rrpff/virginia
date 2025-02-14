# thanks https://gist.github.com/ikey4u/659f38b4d7b3484d0b55de85a55a8154
inkscape=/Applications/Inkscape.app/Contents/MacOS/inkscape
insvg=./assets/logo.svg
output=./apps/desktop/assets/appicon

outdir=${output}.iconset
mkdir $outdir
for sz in 16 32 128 256 512
do
    echo "[+] Generating ${sz}x${sz} png..."
    $inkscape --export-filename=${outdir}/icon_${sz}x${sz}.png -w $sz -h $sz $insvg
    $inkscape --export-filename=${outdir}/icon_${sz}x${sz}@2x.png -w $((sz*2)) -h $((sz*2)) $insvg
done
iconutil --convert icns --output ${output}.icns ${outdir}
echo "[v] The icon is saved to ${output}.icns."
rm -rf ${outdir}