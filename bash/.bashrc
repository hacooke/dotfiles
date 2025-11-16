#  
#     ██████╗  █████╗ ███████╗██╗  ██╗██████╗  ██████╗
#     ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔══██╗██╔════╝
#     ██████╔╝███████║███████╗███████║██████╔╝██║     
#     ██╔══██╗██╔══██║╚════██║██╔══██║██╔══██╗██║     
#  ██╗██████╔╝██║  ██║███████║██║  ██║██║  ██║╚██████╗
#  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
#                                                     
# Author: Harry Cooke
# Source: github.com/hacooke/dotfiles/bash/.bashrc
#
# Incomplete and outdated, needs a rebuild
# TODO
# + Remove/simplify/relocate conda logic
# + Better prompt configuration

## Imports
# Source global definitions
include() {
    if [ -f $1 ]; then
        . $1
    fi
}
include /etc/bashrc
# > global definitions
include $HOME/scripts/functions.sh
# > provides pathensure
include $HOME/scripts/shortcuts.sh
# > provides various navigation aliases
include $HOME/.config/system/config.sh
# > system-specific variables

## Default programs
export BROWSER="/usr/bin/qutebrowser"
export EDITOR="/usr/bin/vim"
export TERMINAL="/usr/bin/urxvt"

## Globals
export XDG_CONFIG_HOME="$HOME/.config"

## System path
export PATH
pathensure "$HOME/bin"
pathensure "$HOME/.local/bin"
pathensure "$HOME/scripts/bin"

## Aliases
alias mutt='neomutt'
alias conon='conda activate'
alias conoff='conda deactivate'
alias v='vim'
alias r='ranger'
alias gfullwarn='g++ -Wall -Wextra -Werror -Wfatal-errors -pedantic-errors -Wshadow -std=c++11'
alias nw-restart='sudo ~/bin/network-restart'
alias todo='task next +work'
alias pls='sudo !!'
alias info='info --vi-keys'

## Binds
bind -x '"":"tmux-sessionizer"'

## Xresources
xrdb -merge ~/.Xresources

## Miscellaneous
### Fonts
xset +fp $HOME/.local/share/fonts
xset fp rehash

### Conda
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$("$HOME/anaconda3/bin/conda" 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
        . "$HOME/anaconda3/etc/profile.d/conda.sh"
    else
        pathensure "$HOME/anaconda3/bin"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
# Me messing with conda PS1:
function __ps1_update {
    col1='\e[00;97;41m\]'
    col1i2='\e[00;31;42m\]'

    col2='\e[01;97;42m\]'
    col2i3='\e[00;32;43m\]'
    col2i4='\e[00;32;44m\]'
    col2i6='\e[00;32;46m\]'

    col3='\e[01;97;43m\]'
    col3id='\e[00;33;49m\]'

    col4='\e[01;97;44m\]'
    col4id='\e[00;34;49m\]'

    col6='\e[01;97;46m\]'
    col6id='\e[00;36;49m\]'

    col_def='\e[0;0m\]'

    PS1_core="$col1\u@\h $col1i2$col2\W "
    PS1_prefix=''
    PS1_prompt=''
    if [ "$CONDA_DEFAULT_ENV" = "" ]; then
        #CONDA NOT ACTIVE, REGULAR PROMPT
        if [ "$EUID" -ne 0 ]; then PS1_prompt="$col2i4$col4\$$col4id"
        else PS1_prompt="$col2i3$col3\$$col3id"; fi
    else
        #CONDA IS ACTIVE, SNAKEY ARROW PROMPT
        PS1_prompt="$col2i6$col6\$$col6id"
        if [ "$CONDA_DEFAULT_ENV" != "base" ]; then
            #NON-DEFAULT ENVIRONMENT, SPECIFY ENV NAME
            PS1_prefix='\e[01;00;32m$(basename "${CONDA_DEFAULT_ENV}")'
        fi
    fi
    #printf '\n'
    export PS1="$PS1_prefix$PS1_core$PS1_prompt$col_def "
}
#__ps1_update
#PROMPT_COMMAND='__ps1_update'

### Go
export GOPATH=$HOME/go

### Dircolors
eval $(dircolors ~/.dircolors)

# Manually construct PS1 to look like this?
# harry  ~  dotfiles 

#powerline-daemon -q
#POWELINE_BASH_CONTINUATION=1
#POWERLINE_BASH_SELECT=1
#. /home/harry/.local/lib/python3.7/site-packages/powerline/bindings/bash/powerline.sh
