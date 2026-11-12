# dotinstall child script. Usage: dotinstall herdr

# dependencies
dotinstall paru stow jq fzf

# herdr-core-bin provides the terminal CLI (`hc`) and persistent backend.
# herdr-app-bin provides the native GUI and depends on herdr-core.
# Use AUR binary packages; legacy herdr-bin is a separate application.
paru -S --needed --noconfirm herdr-core-bin herdr-app-bin

# Install config from dotfiles
stow -d ~/dotfiles herdr

# Dependencies
# herdr-app-bin depends on herdr-core>=0.1.11; herdr-core-bin provides it.
