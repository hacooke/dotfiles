# Vim Configuration

## Prerequisites

### Font
A NerdFont will be required for status line and dev icons.
Preferably Iosevka NF, which can be found here:
```
https://github.com/ryanoasis/nerd-fonts/releases
```

### FZF
Need to install fzf for fzf.vim integration
```
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf
~/.fzf/install
```
## Setup
Linting and completion with ALE:
To setup ALE for a given filetype, open a source file and run `:ALEInfo`.
This will show 'Available Linters', which I believe are the linters ALE recommends for that language,
and 'Enabled Linters' which look to be the ones which are installed and usable.
Also ensure a fixer is installed.
Components installed so far:
* jedi-language-server (Python LSP) [pip]
* black (Python fixer) [pip]
* vim-language-server (Vimscript LSP) [npm]

## Not included
Some plugins I have used in the past are not included here, may review if they are useful in future:
 * goyo.vim
 * julia-vim
 * kotlin-vim
 * spotdiff.vim
 * tagbar
 * vim-latex
 * vim-pandoc
 * vim-pandoc-syntax
 * vim-root
 * vimux
 * Colorizer
