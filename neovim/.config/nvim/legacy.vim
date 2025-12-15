"
"  ███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗███╗   ███╗
"  ████╗  ██║██╔════╝██╔═══██╗██║   ██║██║████╗ ████║
"  ██╔██╗ ██║█████╗  ██║   ██║██║   ██║██║██╔████╔██║
"  ██║╚██╗██║██╔══╝  ██║   ██║╚██╗ ██╔╝██║██║╚██╔╝██║
"  ██║ ╚████║███████╗╚██████╔╝ ╚████╔╝ ██║██║ ╚═╝ ██║
"  ╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═══╝  ╚═╝╚═╝     ╚═╝
"
" Neovim configuration migrated from vim
" Author: Harry Cooke

"" Basic options
set mouse=a
set clipboard=unnamedplus
let mapleader=" "

" Neovim defaults (already set, but explicit for clarity)
syntax on
set nocompatible
filetype plugin indent on

""" Conceal
let g:vim_json_conceal=0
let g:vim_json_syntax_conceal = 0
let g:vim_markdown_conceal = 0
let g:vim_markdown_conceal_code_blocks = 0

""" Encoding (UTF-8 is default in Neovim)
set encoding=utf-8
scriptencoding utf-8

""" Session files
" Neovim uses standard XDG directories by default
set directory^=~/.local/share/nvim/swap//
set undofile
set undodir^=~/.local/share/nvim/undo//

"" Aesthetic
set termguicolors

" No charachters in verts and folds
set fillchars=vert:\ ,fold:\ 

""" Line numbers
set relativenumber
set number
noremap <Leader>n :<C-u>set relativenumber!<CR>:set number!<CR>

""" Custom colouring
highlight LineNr ctermfg=130
highlight CursorLineNr ctermfg=130
highlight LineNrAbove ctermfg=8
highlight LineNrBelow ctermfg=8
highlight FoldColumn ctermbg=1 ctermfg=7
highlight VertSplit ctermfg=0
highlight Folded ctermbg=None ctermfg=244
highlight StatusLine ctermfg=8
highlight StatusLineNC ctermfg=8
highlight NonText ctermfg=8
highlight SignColumn ctermbg=None ctermfg=8
"highlight DiffAdd ctermbg=85 guibg='SeaGreen1'
"highlight DiffText ctermfg=7 guifg='White'
" TODO review these, remove most and leave to colorscheme?

" " Make background transparent to match terminal
" let g:transparent_background = 1
" function! TransparentBackground()
"     if g:transparent_background == 0
"         return
"     endif
"     highlight Normal guibg=NONE ctermbg=NONE
"     highlight NormalNC guibg=NONE ctermbg=NONE
"     highlight NormalFloat guibg=NONE ctermbg=NONE
"     highlight NormalSB guibg=NONE ctermbg=NONE
"     highlight StatusLine guibg=NONE ctermbg=NONE
"     highlight NonText guibg=NONE ctermbg=NONE
"     highlight LineNr guibg=NONE ctermbg=NONE
"     highlight SignColumn guibg=NONE ctermbg=NONE
"     highlight EndOfBuffer guibg=NONE ctermbg=NONE
"     highlight Folded guibg=NONE ctermbg=NONE
"     highlight lualine_c_normal guibg=NONE ctermbg=NONE
"     highlight lualine_c_insert guibg=NONE ctermbg=NONE
"     highlight lualine_c_visual guibg=NONE ctermbg=NONE
"     highlight lualine_c_replace guibg=NONE ctermbg=NONE
"     highlight lualine_c_command guibg=NONE ctermbg=NONE
"     highlight lualine_c_inactive guibg=NONE ctermbg=NONE
" endf
" call TransparentBackground()
" autocmd ColorScheme * call TransparentBackground()

"" Tab behaviour
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab

"" Windows
set splitright
set splitbelow
" Use ctrl-[hjkl] to select the active split
nmap <silent> <C-k> :<C-u>wincmd k<CR>
nmap <silent> <C-j> :<C-u>wincmd j<CR>
nmap <silent> <C-h> :<C-u>wincmd h<CR>
nmap <silent> <C-l> :<C-u>wincmd l<CR>

""" Terminal mode mappings
tnoremap <Esc> <C-\><C-n>
tnoremap <C-h> <C-w><C-h>
tnoremap <C-h> <C-w><C-h>
tnoremap <C-j> <C-w><C-j>
tnoremap <C-k> <C-w><C-k>
tnoremap <C-l> <C-w><C-l>

"" Folds
""" Custom fold text
fu! CustomFoldText()
    "get first non-blank line
    let fs = v:foldstart
    if getline(fs) =~ '^\s*$'
      let fs = nextnonblank(fs + 1)
    endif
    if fs > v:foldend
        let line = getline(v:foldstart)
    else
        let line = substitute(getline(fs), '\t', repeat(' ', &tabstop), 'g')
    endif
    let pat  = matchstr(&l:cms, '^\V\.\{-}\ze%s\m')
    " remove leading comments from line
    let line = substitute(line, '^\s*'.pat.'*\s*', '', '')
    " remove foldmarker from line
    let pat  = '\%('. pat. '\)\?\s*'. split(&l:fmr, ',')[0]. '\s*\d\+'
    let line = substitute(line, pat, '', '')
    let w = get(g:, 'custom_foldtext_max_width', winwidth(0)) - &foldcolumn - (&number ? 8 : 0)
    let foldSize = 1 + v:foldend - v:foldstart
    let foldSizeStr = " " . foldSize . " lines "
    if v:foldlevel == 1
        let foldlevelchar = '●'
    elseif v:foldlevel == 2
        let foldlevelchar = '○'
    elseif v:foldlevel == 3
        let foldlevelchar = '◉'
    else
        let foldlevelchar = '+'
    endif
    let foldlevelstr = repeat(' ', 2*(v:foldlevel-1)).foldlevelchar.' '
    let foldstartstr = '{ '
    let foldendstr = '}'
    let foldchar = matchstr(&fillchars, 'fold:\zs.')
    if exists("*strwdith")
        let expansionstring = repeat(foldchar, w - strwidth(foldSizeStr.line.foldlevelstr.foldstartstr.foldendstr))
    else
        let expansionstring = repeat(foldchar, w - strlen(substitute(foldSizeStr.line.foldlevelstr.foldstartstr.foldendstr, '.', 'x', 'g')))
    endif
    return foldstartstr . foldlevelstr . line . expansionstring . foldSizeStr . foldendstr
endf
set foldtext=CustomFoldText()

""" Comment based folding
function! MultiCommentFold()
    let line = getline(v:lnum)
    let nextline = getline(v:lnum+1)
    let comment = substitute(&commentstring, '\(%s\|\s\)', "", "g")
    let matchstring = '^\'.comment.'\{2,}'
    if line =~ matchstring
        return '>'.(matchend(line, matchstring)-1)
    else
        return '='
    endif
endf

"" Search
set ignorecase
set smartcase
set incsearch
set hlsearch
noremap <Leader>hh :<C-u>noh<CR>
" Open a quickfix window for the last search
nnoremap <silent> <Leader>/ :execute 'vimgrep /'.@/.'/g %' <bar> copen<CR>
" Ack for the last search (if Ack is installed)
nnoremap <silent> <Leader>? :execute "Ack! " . substitute(substitute(substitute(@/, '\\\\<', '', ''), '\\\\>', '', ''), '\\\\v', '', '')<CR>
" Show index for search
set shortmess -=S

"" Compiling
autocmd QuickFixCmdPost [^l]* nested cwindow 5
autocmd QuickFixCmdPost l* nested lwindow 5
noremap <silent> <Leader>m :<C-u>make<CR>

"" Spell checking
set spellfile=~/.config/nvim/spell/en.utf-8.add
highlight SpellBad ctermbg=5 ctermfg=15

"" Other

" Neovim clipboard (wl-clipboard for Wayland)
" NOTE: Neovim handles clipboard better by default, but keep this for Wayland
let g:clipboard = {
    \ 'name': 'wl-clipboard',
    \ 'copy': {
    \    '+': 'wl-copy --type text/plain',
    \    '*': 'wl-copy --type text/plain',
    \  },
    \ 'paste': {
    \    '+': 'wl-paste --no-newline',
    \    '*': 'wl-paste --no-newline',
    \ },
\ }

"" Local config files
silent! so .vimlocal
