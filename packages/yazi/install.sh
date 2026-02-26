# dotinstall child script. Usage: dotinstall yazi
pkg_install yazi

# Install config from dotfiles
stow -d ~/dotfiles yazi

# Dependencies
dotinstall 7zip
