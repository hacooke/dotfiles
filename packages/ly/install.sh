# dotinstall child script. Usage: dotinstall ly
$PKG_INSTALL ly

# Install config from dotfiles
sudo stow -d ~/dotfiles -t /etc ly

# Run the following commands to enable
# systemctl enable ly@tty2.service
# systemctl disable getty@tty2.service

# Dependencies
# dotinstall <otherpackage>
