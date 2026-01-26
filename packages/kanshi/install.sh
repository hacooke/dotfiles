# dotinstall child script. Usage: dotinstall kanshi
$PKG_INSTALL kanshi

# Install config from dotfiles
stow -d ~/dotfiles kanshi

# Dependencies
# dotinstall <otherpackage>
