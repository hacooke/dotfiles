# dotinstall child script. Usage: dotinstall kanshi
pkg_install kanshi

# Install config from dotfiles
stow -d ~/dotfiles kanshi

# Dependencies
# dotinstall <otherpackage>
