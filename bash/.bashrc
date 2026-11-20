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
export BROWSER="/usr/sbin/firefox"
export EDITOR="/usr/bin/nvim"
export TERMINAL="/usr/bin/ghostty"

## Globals
export XDG_CONFIG_HOME="$HOME/.config"

## System path
export PATH
pathensure "$HOME/bin"
pathensure "$HOME/.local/bin"
pathensure "$HOME/scripts/bin"
pathensure -p "$HOME/.cargo/bin"

## Aliases
alias ls='ls --color'
alias grep='grep --color'
alias mutt='neomutt'
alias v='vim'
alias r='ranger'
alias gfullwarn='g++ -Wall -Wextra -Werror -Wfatal-errors -pedantic-errors -Wshadow -std=c++11'
alias nw-restart='sudo ~/bin/network-restart'
alias todo='task next +work'
alias pls='sudo !!'
alias info='info --vi-keys'

## Binds
[[ $- == *i* ]] && command -v bind >/dev/null 2>&1 && bind -x '"":"tmux-sessionizer"'

## Yazi
# Change working directory on exit (if started with y)
# Exit with q to change dir, exit with Q to not.
function y() {
	local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
	yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ -n "$cwd" ] && [ "$cwd" != "$PWD" ] && builtin cd -- "$cwd"
	rm -f -- "$tmp"
}

## Xresources
command -v xrdb >/dev/null 2>&1 && xrdb -merge ~/.Xresources

## Miscellaneous

### fzf

source /usr/share/fzf/key-bindings.bash
source /usr/share/fzf/completion.bash
### Prompt
__prompt_update() {
    local last_status=$?
    local reset='\[\e[0m\]'
    local blue='\[\e[34m\]'
    local green='\[\e[32m\]'
    local yellow='\[\e[33m\]'
    local red='\[\e[31m\]'
    local pink='\[\e[35m\]'
    local dim='\[\e[2;37m\]'
    local git_info=''
    local git_text=''
    local env_name=''
    local env_text=''
    local status_info=''
    local status_text=''
    local prompt_symbol='❯'
    local symbol_color=$green

    if git_info=$(git branch --show-current 2>/dev/null) && [[ -n $git_info ]]; then
        [[ -n $(git status --porcelain 2>/dev/null) ]] && git_info+='*'
        git_text="  ${git_info}"
        git_info=" ${blue} ${git_info}${reset}"
    else
        git_info=''
    fi

    if [[ -n ${VIRTUAL_ENV:-} ]]; then
        env_name=${VIRTUAL_ENV##*/}
        env_text=" (${env_name})"
        env_name=" ${yellow}(${env_name})${reset}"
    fi

    if (( last_status != 0 )); then
        status_text=" ✘ ${last_status}"
        status_info=" ${red}✘ ${last_status}${reset}"
    fi

    if (( EUID == 0 )); then
        prompt_symbol='#'
        symbol_color=$red
    fi

    local remote_info=''
    local remote_text=''
    [[ -n ${SSH_CONNECTION:-} ]] && {
        remote_info="${dim}\u@\h ${reset}"
        remote_text="${USER}@${HOSTNAME%%.*} "
    }

    local prompt_path=$PWD
    if [[ $prompt_path == "$HOME" ]]; then
        prompt_path='~'
    elif [[ $prompt_path == "$HOME/"* ]]; then
        prompt_path="~${prompt_path#"$HOME"}"
    fi

    local timestamp right_prompt=''
    printf -v timestamp '%(%H:%M:%S)T' -1
    local left_width=$(( ${#remote_text} + 3 + ${#prompt_path} + ${#git_text} + ${#env_text} + ${#status_text} ))
    local terminal_columns=${COLUMNS:-80}
    local right_column=$(( terminal_columns - ${#timestamp} ))
    if (( right_column > left_width + 2 )); then
        right_prompt="\[\e[s\e[${right_column}G\]${dim}${timestamp}${reset}\[\e[u\]"
    fi

    PS1="${symbol_color}╭─ ${reset}${remote_info}${pink}\w${reset}${git_info}${env_name}${status_info}${right_prompt}"$'\n'"${symbol_color}╰─ ${reset}${symbol_color}${prompt_symbol} ${reset}"
}

PROMPT_COMMAND=__prompt_update

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

export STM32_PRG_PATH=/home/harry/sources/STM32CubProg/bin
