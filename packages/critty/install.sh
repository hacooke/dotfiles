# dotinstall child script. Usage: dotinstall critty
dotinstall stow jq || return 1

mkdir -p "$HOME/.local/bin" || return 1
(
    set -o pipefail
    curl -fsSL https://github.com/crittylabs/critty/releases/latest/download/critty_linux_amd64.tar.gz |
        tar -xz -C "$HOME/.local/bin" critty
) || return 1

stow -d ~/dotfiles critty
