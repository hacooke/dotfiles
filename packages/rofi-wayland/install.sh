# dotinstall child script. Usage: dotinstall rofi-wayland
pkg_install rofi-wayland

# Install config from dotfiles
stow -d ~/dotfiles rofi

# Dependencies
# dotinstall <otherpackage>
