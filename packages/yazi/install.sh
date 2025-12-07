# dotinstall child script. Usage: dotinstall yazi
$PKG_INSTALL yazi

# Install config from dotfiles
stow -d ~/dotfiles yazi

# Dependencies
dotinstall 7zip
