let s:black = [ '#000000', 0 ]
let s:maroon = [ '#800000', 1 ]
let s:green = [ '#008000', 2 ]
let s:olive = [ '#808000', 3 ]
let s:navy = [ '#000080', 4 ]
let s:purple = [ '#800080', 5 ]
let s:teal = [ '#008080', 6 ]
let s:silver = [ '#c0c0c0', 7 ]
let s:gray = [ '#808080', 8]
let s:red = [ '#ff0000', 9 ]
let s:lime = [ '#00ff00', 10 ]
let s:yellow = [ '#ffff00', 11 ]
let s:blue = [ '#0000ff', 12 ]
let s:fuchsia = [ '#ff00ff', 13 ]
let s:aqua = [ '#00ffff', 14 ]
let s:white = [ '#ffffff', 15 ]

"Function to set colour from current Highlights (if desired)
function! GetHighlightGroupColours(group, type)
    if !exists("*hlget")
        return a:type == 'fg' ? ['White', 1] : ['Black', 'NONE']
    endif
    let hl = hlget(a:group)
    return [
    \   get(hl[0], 'gui'.a:type, a:type=='fg' ? 'White' : 'Black'),
    \   get(hl[0], 'cterm'.a:type, a:type=='fg' ? 1 : 'NONE')
    \]
endfunction

let s:background = GetHighlightGroupColours('Normal', 'bg')
let s:normal_strong = GetHighlightGroupColours('FoldColumn','bg')

let s:p = {'normal': {}, 'inactive': {}, 'insert': {}, 'replace': {}, 'visual': {}, 'tabline': {}}
let s:p.normal.left = [ [s:white, s:maroon], [s:silver, s:gray], [s:silver, s:black] ]
let s:p.normal.middle = [ [ s:silver, s:background ] ]
let s:p.normal.right = copy(s:p.normal.left)

let s:p.insert.left = [ [s:white, s:green], [s:silver, s:gray], [s:silver, s:black] ]
let s:p.insert.right = copy(s:p.insert.left)
let s:p.replace.left = [ [s:white, s:teal], [s:silver, s:gray], [s:silver, s:black] ]
let s:p.replace.right = copy(s:p.replace.left)
let s:p.visual.left = [ [s:white, s:olive], [s:silver, s:gray], [s:silver, s:black] ]
let s:p.visual.right = copy(s:p.visual.left)

let s:p.normal.error = [ [ s:black, s:red ] ]
let s:p.normal.warning = [ [ s:black, s:yellow ] ]

let s:p.inactive.left =  [ [s:silver, s:gray], [s:gray, s:black] ]
let s:p.inactive.middle = [ [ s:silver, s:black ] ]
let s:p.inactive.right = copy(s:p.inactive.left)

let s:p.tabline.left = [ [ s:silver, s:black ] ]
let s:p.tabline.tabsel = copy(s:p.normal.right)
let s:p.tabline.middle = [ [ s:silver, s:black ] ]
let s:p.tabline.right = copy(s:p.normal.right)

let g:lightline#colorscheme#hc#palette = lightline#colorscheme#flatten(s:p)
