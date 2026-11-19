# dotinstall child script. Usage: dotinstall pi
curl -fsSL https://pi.dev/install.sh | sh

# Install config from dotfiles
stow -d ~/dotfiles pi

# Pi does not install dependencies for local packages.
npm ci --prefix "$HOME/.pi/agent/packages/pi-subagents" --omit=dev --ignore-scripts

# Dependencies
# dotinstall <otherpackage>
