# dotinstall child script. Usage: dotinstall matplotlib
pkg_install python-matplotlib

# Install config from dotfiles
stow -d ~/dotfiles matplotlib

# Dependencies
# dotinstall <otherpackage>
