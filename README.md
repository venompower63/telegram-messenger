# Telegram Messenger

A Telegram-style messenger built with React and Capacitor for Android.

## Features

- 💬 Chat with contacts
- 📷 Send images, videos, audio, documents
- 📰 Create and subscribe to channels
- 📱 Stories with view functionality
- 👤 Profile settings and status

## Build Android APK

The project includes GitHub Actions workflow for automatic Android builds.

To trigger the build:

1. Go to the **Actions** tab in your GitHub repository
2. Click on **Build Android APK** workflow
3. Click **Run workflow**

The APK will be available in the workflow artifacts.

## Manual Build

```bash
npm install
npx cap add android
npx cap sync android
npx cap copy
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`
