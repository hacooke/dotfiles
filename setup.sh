# Get install command
set -e
# This is code from detect_pkg_manager.sh, included here for portability
# Debian/Ubuntu
if command -v apt-get >/dev/null 2>&1; then
    pkg_install() { sudo apt-get update && sudo apt-get install -y "$@"; }
# Fedora
elif command -v dnf >/dev/null 2>&1; then
    pkg_install() { sudo dnf install -y "$@"; }
# RHEL / CentOS
elif command -v yum >/dev/null 2>&1; then
    pkg_install() { sudo yum install -y "$@"; }
# Arch Linux
elif command -v pacman >/dev/null 2>&1; then
    pkg_install() { sudo pacman -Sy --noconfirm "$@"; }
# Alpine
elif command -v apk >/dev/null 2>&1; then
    pkg_install() { sudo apk add "$@"; }
# openSUSE
elif command -v zypper >/dev/null 2>&1; then
    pkg_install() { sudo zypper install -y "$@"; }
# Gentoo
elif command -v emerge >/dev/null 2>&1; then
    pkg_install() { sudo emerge "$@"; }
# macOS / Linuxbrew
elif command -v brew >/dev/null 2>&1; then
    pkg_install() { brew install "$@"; }
# FreeBSD
elif command -v pkg >/dev/null 2>&1; then
    pkg_install() { sudo pkg install -y "$@"; }
# OpenBSD
elif command -v pkg_add >/dev/null 2>&1; then
    pkg_install() { sudo pkg_add "$@"; }
# Nix / NixOS
elif command -v nix-env >/dev/null 2>&1; then
    pkg_install() { nix-env -iA "$@"; }
else
    echo "No supported package manager found." >&2
    echo "Set pkg_install function manually to override" >&2
    exit 1
fi

echo "=== Installing basic dependencies ============================================="
pkg_install git stow vi grep

echo "=== Cloning dotfile repository ================================================"
if [ ! -d "$HOME/dotfiles" ]; then
    git clone https://github.com/hacooke/dotfiles.git ~/dotfiles
else
    echo "Dotfiles already cloned. Pulling latest..."
    git -C ~/dotfiles pull
fi

echo "=== Configuring install scripts ==============================================="
stow -d ~/dotfiles setup

echo "=== Optional additional installs =============================================="
minimal="bash git neovim tmux"
read -p "Recommended minimal installs: $minimal. Continue? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    ~/dotfiles/setup/scripts/bin/dotinstall $minimal
fi
echo "Complete."
