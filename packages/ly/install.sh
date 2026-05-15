# dotinstall child script. Usage: dotinstall ly

# Install config from dotfiles
sudo stow -d ~/dotfiles -t /etc ly

pkg_install ly

cat << EOF
Run the following commands to enable:
systemctl enable ly@tty2.service
systemctl disable getty@tty2.service
EOF

# Dependencies
# dotinstall <otherpackage>
