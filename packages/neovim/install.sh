# dotinstall child script. Usage: dotinstall neovim
pkg_install neovim

# Install config from dotfiles
stow -d ~/dotfiles neovim

# Dependencies
dotinstall luarocks fzf ripgrep fd cmake yazi npm
