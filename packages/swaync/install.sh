# dotinstall child script. Usage: dotinstall swaync
$PKG_INSTALL swaync

# Install config from dotfiles
stow -d ~/dotfiles swaync

# Dependencies
dotinstall libnotify
