# Настройка GitHub Actions для Android сборки

## Проблема

Ваш текущий токен доступа (OAuth App token) не имеет прав на создание workflow файлов.

## Решение: Добавить workflow вручную

### Шаг 1: Откройте GitHub

Перейдите на страницу репозитория:
https://github.com/venompower63/telegram-messenger

### Шаг 2: Создайте файл workflow

1. Нажмите **Add file** → **Create new file**
2. В поле "Name your file..." введите: `.github/workflows/android.yml`
3. Скопируйте содержимое из файла `android-workflow.yml` ниже
4. Нажмите **Commit changes**

### Содержимое android-workflow.yml:

```yaml
name: Build Android APK

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Add Android platform
        run: npx cap add android

      - name: Sync web assets
        run: npx cap sync android

      - name: Build web app
        run: npm run build

      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: messenger-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

### Шаг 3: Запустите сборку

1. Перейдите на вкладку **Actions** в репозитории
2. Вы увидите workflow "Build Android APK"
3. Нажмите **Run workflow** → **Run workflow**

### Шаг 4: Скачайте APK

После завершения сборки:
1. Кликните на название workflow run
2. Нажмите на artifact **messenger-apk**
3. Скачайте ZIP архив
4. Распакуйте — внутри будет `app-debug.apk`

---

## Альтернатива: Создать Personal Access Token

Если вы хотите автоматизировать создание workflow:

1. Откройте https://github.com/settings/tokens
2. Нажмите **Generate new token (classic)**
3. Выберите scopes: `repo`, `workflow`
4. Скопируйте токен
5. Добавьте токен в настройки проекта

---
