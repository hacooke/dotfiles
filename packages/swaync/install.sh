# dotinstall child script. Usage: dotinstall swaync
pkg_install swaync

# Install config from dotfiles
stow -d ~/dotfiles swaync

# Dependencies
dotinstall libnotify
