# dotinstall child script. Usage: dotinstall swayosd
pkg_install swayosd

# Install config from dotfiles
stow -d ~/dotfiles swayosd

# Dependencies
# dotinstall <otherpackage>
