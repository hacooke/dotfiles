pathensure() {
    : 'Takes a path (or multiple paths) and ensures they are in $PATH.

    If -p option given, prepend to beginning of PATH, else append to end
    '
    local OPTIND=1 opt prepend=false pathadd i
    local -a paths
    while getopts "p" opt; do
        case "$opt" in
            p) prepend=true;;
        esac
    done
    shift $((OPTIND-1))
    paths=("$@")

    # Process each path, reversing order when prepending
    if [ "$prepend" = true ]; then
        for ((i=${#paths[@]} - 1; i >= 0; i--)); do
            pathadd=${paths[i]}
            if [[ "$PATH" =~ (^|:)"$pathadd"(:|$) ]]; then
                continue
            fi
            export PATH="$pathadd:$PATH"
        done
    else
        for pathadd in "${paths[@]}"; do
            if [[ "$PATH" =~ (^|:)"$pathadd"(:|$) ]]; then
                continue
            fi
            export PATH="$PATH:$pathadd"
        done
    fi
}
