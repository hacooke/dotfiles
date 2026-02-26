# dotinstall child script. Usage: dotinstall tmux
pkg_install tmux

# Install config from dotfiles
 stow -d ~/dotfiles tmux
