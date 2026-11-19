# dotinstall child script. Usage: dotinstall pi
curl -fsSL https://pi.dev/install.sh | sh

# Install config from dotfiles
stow -d ~/dotfiles pi

# Pi does not install dependencies for local packages.
pi_subagents_dir="$HOME/.pi/agent/packages/pi-subagents"
if ! npm ci --prefix "$pi_subagents_dir" --omit=dev --ignore-scripts; then
  echo "Failed to install pi-subagents dependencies" >&2
  return 1
fi
if ! (cd "$pi_subagents_dir" && node --input-type=module -e 'await import("yaml")'); then
  echo "pi-subagents cannot resolve its yaml runtime dependency at $pi_subagents_dir" >&2
  return 1
fi

# Dependencies
# dotinstall <otherpackage>
