# dotinstall child script. Usage: dotinstall hyprlock
$PKG_INSTALL hyprlock

# Install config from dotfiles
stow -d ~/dotfiles hyprlock

# Dependencies
# dotinstall <otherpackage>
