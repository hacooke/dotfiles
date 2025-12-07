# dotinstall child script. Usage: dotinstall xdg-utils
$PKG_INSTALL xdg-utils

# Install config from dotfiles
stow -d ~/dotfiles mime

# Dependencies
# dotinstall <otherpackage>
