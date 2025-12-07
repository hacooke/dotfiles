# dotinstall child script. Usage: dotinstall rofi-wayland
$PKG_INSTALL rofi-wayland

# Install config from dotfiles
stow -d ~/dotfiles rofi

# Dependencies
# dotinstall <otherpackage>
