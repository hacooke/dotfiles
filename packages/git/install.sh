# dotinstall child script. Usage: dotinstall git
pkg_install git

# Install config from dotfiles
 stow -d ~/dotfiles git
