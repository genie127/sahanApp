@ECHO OFF
SET ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
SET PATH=C:\nodejs;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%PATH%

echo [run-android] node version:
node --version

echo [run-android] adb devices:
adb devices

echo.
echo [run-android] Expo 시작 (--android)...

node_modules\.bin\expo.cmd start --android --port 8081 %*
