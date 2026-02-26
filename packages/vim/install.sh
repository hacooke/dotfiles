# dotinstall child script. Usage: dotinstall vim
pkg_install gvim
# Install from gvim package (usually has clipboard support)

# Install config from dotfiles
stow -d ~/dotfiles vim

# Dependencies
dotinstall fzf
