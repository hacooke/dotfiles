# Debian/Ubuntu
if command -v apt-get >/dev/null 2>&1; then
    PKG_INSTALL="sudo apt-get update && sudo apt-get install -y"
# Fedora
elif command -v dnf >/dev/null 2>&1; then
    PKG_INSTALL="sudo dnf install -y"
# RHEL / CentOS
elif command -v yum >/dev/null 2>&1; then
    PKG_INSTALL="sudo yum install -y"
# Arch Linux
elif command -v pacman >/dev/null 2>&1; then
    PKG_INSTALL="sudo pacman -Sy --noconfirm"
# Alpine
elif command -v apk >/dev/null 2>&1; then
    PKG_INSTALL="sudo apk add"
# openSUSE
elif command -v zypper >/dev/null 2>&1; then
    PKG_INSTALL="sudo zypper install -y"
# Gentoo
elif command -v emerge >/dev/null 2>&1; then
    PKG_INSTALL="sudo emerge"
# macOS / Linuxbrew
elif command -v brew >/dev/null 2>&1; then
    PKG_INSTALL="brew install"
# FreeBSD
elif command -v pkg >/dev/null 2>&1; then
    PKG_INSTALL="sudo pkg install -y"
# OpenBSD
elif command -v pkg_add >/dev/null 2>&1; then
    PKG_INSTALL="sudo pkg_add"
# Nix / NixOS
elif command -v nix-env >/dev/null 2>&1; then
    PKG_INSTALL="nix-env -iA"
else
    echo "No supported package manager found." >&2
    echo "Set PKG_INSTALL manually to override" >&2
    exit 1
fi

export PKG_INSTALL
