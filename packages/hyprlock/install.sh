# dotinstall child script. Usage: dotinstall hyprlock
pkg_install hyprlock

# Install config from dotfiles
stow -d ~/dotfiles hyprlock

# Dependencies
# dotinstall <otherpackage>
