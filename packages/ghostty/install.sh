# dotinstall child script. Usage: dotinstall ghostty
pkg_install ghostty

# Install config from dotfiles
stow -d ~/dotfiles ghostty
