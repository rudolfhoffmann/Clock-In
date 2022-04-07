Clock-In

Push code to GitHub
git remote add origin https://github.com/rudolfhoffmann/Clock-In.git
git push -u origin master

-------------------------

Sign Android Bundle

1) Generate bundle for release: go to ./android:
./gradlew bundleRelease

2) Navigate to:
cd ~/projects/ionic/Clock-In/android/app/build/outputs/bundle/release/

3) Generate key if not available (use default pw and set Invoices as alias name):
keytool -genkey -v -keystore clockin-release-key.keystore -alias ClockIn -keyalg RSA -keysize 2048 -validity 10000

Zertifikatsdaten siehe Clock-In Doku

4) Sign the bundle:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/projects/ionic/Clock-In/android/app/build/outputs/bundle/release/clockin-release-key.keystore ~/projects/ionic/Clock-In/android/app/build/outputs/bundle/release/app-release.aab ClockIn
