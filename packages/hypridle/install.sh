# dotinstall child script. Usage: dotinstall hypridle
pkg_install hypridle

# Install config from dotfiles
stow -d ~/dotfiles hypridle

# Dependencies
dotinstall hyprlock
