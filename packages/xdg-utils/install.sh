# dotinstall child script. Usage: dotinstall xdg-utils
pkg_install xdg-utils

# Install config from dotfiles
stow -d ~/dotfiles mime

# Dependencies
# dotinstall <otherpackage>
