# dotinstall child script. Usage: dotinstall bash
pkg_install bash

# Install config from dotfiles
file='.bashrc'
if [ -f "$HOME/$file" ] && [ ! -L "$HOME/$file" ]; then
    echo "Backing up existing $file to $file.bak"
    mv "$HOME/$file" "$HOME/$file.bak"
fi
stow -d ~/dotfiles bash

# Dependencies
# dotinstall <otherpackage>
