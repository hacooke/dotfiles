function! VimscriptCommentFold()
    let line = getline(v:lnum)
    let nextline = getline(v:lnum+1)
    let matchstring = '^\"\{2,}'
    if line =~ matchstring
        return '>'.(matchend(line, matchstring)-1)
    "alternatively, allow spaces between folds with the following
    "if line =~ matchstring
    "    return matchend(line, matchstring)-1
    " 
    "elseif (nextline =~ matchstring)
    "    return matchend(nextline, matchstring)-2
    else
        return '='
    endif
endf
set foldexpr=VimscriptCommentFold()
" Fold on 2+ quotes, more quotes for higher fold levels
set foldmethod=expr
set foldlevel=0
