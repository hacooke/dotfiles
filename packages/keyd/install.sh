# dotinstall child script. Usage: dotinstall keyd
pkg_install keyd

# Install config from dotfiles
# stow -d ~/dotfiles keyd
sudo stow -d ~/dotfiles -t /etc keyd

# Dependencies
# dotinstall <otherpackage>
systemctl enable --now keyd
