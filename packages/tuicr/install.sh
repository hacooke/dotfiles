# dotinstall child script. Usage: dotinstall tuicr
dotinstall stow jq || return 1
curl -fsSL tuicr.dev/install.sh | sh || return 1

# Install config and tuicr-agent wrapper from dotfiles
stow -d ~/dotfiles tuicr || return 1
