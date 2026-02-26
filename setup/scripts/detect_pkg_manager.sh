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

export -f pkg_install
