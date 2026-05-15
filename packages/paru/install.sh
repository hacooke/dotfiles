# Dependencies
dotinstall base-devel devtools git rust

# Clone
mkdir -p ~/sources
git clone https://aur.archlinux.org/paru.git ~/sources/paru

# Build and install
cd ~/sources/paru
makepkg -Cfi
