# dotinstall child script. Usage: dotinstall ly
pkg_install ly

# Install config from dotfiles
sudo stow -d ~/dotfiles -t /etc ly

# Run the following commands to enable
# systemctl enable ly@tty2.service
# systemctl disable getty@tty2.service

# Dependencies
# dotinstall <otherpackage>
