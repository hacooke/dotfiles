# dotinstall child script. Usage: dotinstall pi
curl -fsSL https://pi.dev/install.sh | sh

# Install config from dotfiles
stow -d ~/dotfiles pi

# Dependencies
# dotinstall <otherpackage>
