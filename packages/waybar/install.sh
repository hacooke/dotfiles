# dotinstall child script. Usage: dotinstall waybar
pkg_install waybar

# Install config from dotfiles
stow -d ~/dotfiles waybar

# Dependencies
# dotinstall <otherpackage>
