#!/bin/sh
# Установка Gitleaks бинаря для локальной разработки и CI
# Версия фиксирована для воспроизводимости

set -e

GITLEAKS_VERSION="8.21.2"
BIN_DIR="./node_modules/.bin"
INSTALL_PATH="$BIN_DIR/gitleaks"

# Проверяем, установлен ли уже Gitleaks
if [ -f "$INSTALL_PATH" ]; then
  echo "✅ Gitleaks already installed at $INSTALL_PATH"
  exit 0
fi

echo "📥 Installing Gitleaks v$GITLEAKS_VERSION..."

# Определяем платформу и архитектуру
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  darwin) OS="darwin" ;;
  linux) OS="linux" ;;
  *) echo "❌ Unsupported OS: $OS"; exit 1 ;;
esac

case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
  *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
esac

# URL для скачивания
URL="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_${OS}_${ARCH}.tar.gz"

echo "📦 Downloading from: $URL"

# Создаём временную директорию
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Скачиваем и распаковываем
curl -sSfL "$URL" | tar -xz -C "$TMP_DIR"

# Создаём директорию bin если нужно
mkdir -p "$BIN_DIR"

# Копируем бинарь
mv "$TMP_DIR/gitleaks" "$INSTALL_PATH"
chmod +x "$INSTALL_PATH"

echo "✅ Gitleaks v$GITLEAKS_VERSION installed successfully to $INSTALL_PATH"
