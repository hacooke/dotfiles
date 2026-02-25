# dotinstall child script. Usage: dotinstall hypridle
$PKG_INSTALL hypridle

# Install config from dotfiles
stow -d ~/dotfiles hypridle

# Dependencies
dotinstall hyprlock
