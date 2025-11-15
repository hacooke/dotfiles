pathensure() {
    : 'Takes a path (or multiple paths) and ensures they are in $PATH.

    If -p option given, prepend to beginning of PATH, else append to end
    '
    local prepend=false
    while getopts "p" opt; do
        case "$opt" in
            p) prepend=true;;
        esac
    done
    shift $((OPTIND-1))
    # reverse args if prepending
    if [ "$prepend" = true ]; then
        paths=($(printf "%s\n" $@ | tac))
    else
        paths=($@)
    fi
    # Process each path
    for pathadd in "${paths[@]}"; do
        if [[ "$PATH" =~ (^|:)"$pathadd"(:|$) ]]; then
            continue
        fi
        if [ "$prepend" = true ]; then
            export PATH=$pathadd:$PATH
        else
            export PATH=$PATH:$pathadd
        fi
    done
}
