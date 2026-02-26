# dotinstall child script. Usage: dotinstall ranger
pkg_install ranger

# Install config from dotfiles
stow -d ~/dotfiles ranger
