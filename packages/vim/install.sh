# dotinstall child script. Usage: dotinstall vim
$PKG_INSTALL vim

# Install config from dotfiles
 stow -d ~/dotfiles vim

# Dependencies
 dotinstall fzf
