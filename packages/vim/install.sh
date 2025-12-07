# dotinstall child script. Usage: dotinstall vim
$PKG_INSTALL gvim
# Install from gvim package (usually has clipboard support)

# Install config from dotfiles
stow -d ~/dotfiles vim

# Dependencies
dotinstall fzf
