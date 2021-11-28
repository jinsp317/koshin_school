@echo off
echo ----------------------------------------------------
echo By @rihyokju
echo Press any key to make android bundle
echo ----------------------------------------------------
pause
del android/app/src/main/assets/index.android.bundle
react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
pause

