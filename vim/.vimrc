"
"    ██╗   ██╗██╗███╗   ███╗██████╗  ██████╗
"    ██║   ██║██║████╗ ████║██╔══██╗██╔════╝
"    ██║   ██║██║██╔████╔██║██████╔╝██║     
"    ╚██╗ ██╔╝██║██║╚██╔╝██║██╔══██╗██║     
"  ██╗╚████╔╝ ██║██║ ╚═╝ ██║██║  ██║╚██████╗
"  ╚═╝ ╚═══╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝
"
" Author: Harry Cooke
" Source: github.com/hacooke/dotfiles/blob/main/vim/.vimrc
"
" My personal vim configuration. Always a work in progress.

"" Basic options
set noshowmode
set conceallevel=0
set mouse=a
set clipboard=unnamedplus
let mapleader=" "
""" Encoding
set encoding=utf-8
scriptencoding utf-8
set fileencoding=utf-8
set termencoding=utf-8
""" Session files
set directory^=~/.vim/tmp/swap//
set undofile                
set undodir^=~/.vim/tmp/undo//

"" Aesthetics
colorscheme default
set t_Co=256
""" Line numbers
set relativenumber
set number
noremap <C-e> :<C-u>set relativenumber!<CR>:set number!<CR>
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
highlight DiffAdd ctermbg=85 guibg='SeaGreen1'
highlight DiffText ctermfg=7 guifg='White'
set fillchars=vert:\ ,fold:\ 

"" Tab behaviour
filetype plugin indent on
set tabstop=4
set shiftwidth=4
set softtabstop=4
set expandtab

"" Windows
set splitright
set splitbelow
"use ctrl-[hjkl] to select the active split
nmap <silent> <C-k> :<C-u>wincmd k<CR>
nmap <silent> <C-j> :<C-u>wincmd j<CR>
nmap <silent> <C-h> :<C-u>wincmd h<CR>
nmap <silent> <C-l> :<C-u>wincmd l<CR>
"use ctrl-[yuio] to resize the active split
nmap <silent> <c-y> <C-w>< <CR>
nmap <silent> <c-u> <C-w>- <CR>
nmap <silent> <c-i> <C-w>+ <CR>
nmap <silent> <c-o> <C-w>> <CR>

"" Folds
""" Custom fold text
" Modified from https://github.com/chrisbra/vim_dotfiles/blob/master/plugin/CustomFoldText.vim
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

"" Search
set ignorecase
set smartcase
set incsearch
set hlsearch
noremap <Leader>h :<C-u>noh<CR>
" Open a quickfix window for the last search.
nnoremap <silent> <Leader>/ :execute 'vimgrep /'.@/.'/g %' <bar> copen<CR>
" Ack for the last search.
nnoremap <silent> <Leader>? :execute "Ack! " . substitute(substitute(substitute(@/, '\\\\<', '', ''), '\\\\>', '', ''), '\\\\v', '', '')<CR>
" Show index for search
set shortmess -=S

"" Compiling
autocmd QuickFixCmdPost [^l]* nested cwindow 3
autocmd QuickFixCmdPost l* nested lwindow 3
noremap <silent> <Leader>m :<C-u>make<CR>

"" Spell checking
set spellfile=~/.vim/spell/en.utf-8.add
highlight SpellBad ctermbg=5 ctermfg=15

"" Packages
""" fzf.vim
set runtimepath+=~/.fzf
nnoremap <Leader>ff :<C-u>Files<CR>
nnoremap <Leader>fb :<C-u>Buffers<CR>
nnoremap <Leader>fg :<C-u>GFiles<CR>
nnoremap <Leader>f/ :<C-u>History/<CR>

""" lightline.vim
set laststatus=2
set noshowmode

"Filenames which should show reduced lightline bar
let s:lightline_veto_filenames = 'NERD_tree'

"""" Component Functions
function! LightlineMode()
    let fname = expand('%:t')
    return fname =~# 'NERD_tree' ? '' : lightline#mode()
endfunction

function! LightlineFilename()
    return expand('%:t') =~# s:lightline_veto_filenames ? expand('%:p:h') : expand('%:t')
endfunction

function! LightlineModified()
      return expand('%:t') =~# s:lightline_veto_filenames ? '' :
\         &ft =~ 'help' ? '' : &modified ? '+' : &modifiable ? '' : '-'
endfunction

function! LightlineReadonly()
    return expand('%:t') =~# s:lightline_veto_filenames ? '' : &readonly ? 'RO' : ''
endfunction

function! LightlineFiletype()
    return expand('%:t') =~# s:lightline_veto_filenames ? '' : &ft!=#""?&ft:"no ft"
endfunction

function! LightlinePercent()
    return expand('%:t') =~# s:lightline_veto_filenames ? '' : (100 * line('.') / line('$')) . '%'
endfunction

function! LightlineLineinfo()
    return expand('%:t') =~# s:lightline_veto_filenames ? '' : printf('%d:%-2d', line('.'), col('.'))
endfunction

" Fugitive integration
function! LightlineGitbranch()
    if expand('%:t') =~# s:lightline_veto_filenames
        return ''
    endif
    try
        if exists('*FugitiveHead')
            "let mark = ' '
            let mark = ' '
            let branch = FugitiveHead()
            return branch !=# '' ? mark.branch : ''
        endif
    catch
    endtry
    return ''
endfunction

" ALE integration
function! LightlineLinterrors() abort
    if expand('%:t') =~# s:lightline_veto_filenames
        return ''
    endif
    let l:counts = ale#statusline#Count(bufnr(''))
    let l:all_errors = l:counts.error + l:counts.style_error
    let l:all_non_errors = l:counts.total - l:all_errors
    return l:counts.total == 0 ? '' : 
    \   l:all_errors == 0 ? all_non_errors.' Warning'.(l:all_non_errors > 1 ? 's' : '') :
    \   l:all_non_errors == 0 ? all_errors.' Error'.(l:all_errors > 1 ? 's' : '') :
    \   printf('%dW %dE', all_non_errors, all_errors)
endfunction

"""" Main config dicts
let g:lightline = {
\   'component_function': {
\       'mode': 'LightlineMode',
\       'filename': 'LightlineFilename',
\       'modified': 'LightlineModified',
\       'readonly': 'LightlineReadonly',
\       'filetype': 'LightlineFiletype',
\       'percent': 'LightlinePercent',
\       'lineinfo': 'LightlineLineinfo',
\       'gitbranch': 'LightlineGitbranch',
\       'linterrors': 'LightlineLinterrors',
\   },
\   'colorscheme': 'hc',
\   'separator': {'left': "\ue0b0", 'right': "\ue0b2"},
\   'subseparator': {'left': "\ue0b1", 'right': "\ue0b3"},
\}
"Colorscheme in autoload/lightline/colorscheme/hc.vim
"Separators add powerline symbols

let g:lightline.active = {
\   'left': [
\       ['mode', 'paste'],
\       ['gitbranch', 'readonly', 'filename', 'modified'],
\   ],
\   'right': [
\       ['lineinfo'],
\       ['percent'],
\       ['filetype', 'linterrors'],
\   ]
\}

""" nerdtree
autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif
let NERDTreeQuitOnOpen = 1
let NERDTreeMinimalUI = 1
let NERDTreeDirArrows = 1
let NERDTreeShowHidden = 1
noremap <Leader>nt :<C-u>NERDTreeToggle<CR>
noremap <Leader>nf :<C-u>NERDTreeFind<CR>
noremap <Leader>nn :<C-u>NERDTreeFocus<CR>
noremap <Leader>nc :<C-u>NERDTreeCWD<CR>

autocmd BufEnter * if &filetype == 'nerdtree' | execute 'NERDTreeRefreshRoot' | endif

"""nerdtree-git-plugin
let g:NERDTreeGitStatusIndicatorMapCustom = {
\   'Modified'  : 'Δ',
\   'Staged'    : '●',
\   'Untracked' : '+',
\   'Renamed'   : '⇄',
\   'Unmerged'  : '≠',
\   'Deleted'   : '-',
\   'Dirty'     : '×',
\   'Ignored'   : '◌',
\   'Clean'     : '✓',
\   'Unknown'   : '?',
\}

"""vim-gitgutter
highlight GitGutterAdd ctermbg=None ctermfg=2
highlight GitGutterChange ctermbg=None ctermfg=3
highlight GitGutterChange ctermbg=None ctermfg=1
set updatetime=1000
"This controls both interval of gitgutter updating and interval of vim's
"swap file updates (default 4000).

""" indentLine
"let g:indentLine_setColors = 0
"let g:indentLine_defaultGroup = 'SpecialKey'
let g:indentLine_color_term = 238
let g:indentLine_char = '│'
let g:indentLine_fileTypeExclude=['tex']

""" ale
let g:ale_completion_enabled=1
let g:ale_virtualtext_cursor='current'
let g:ale_detail_to_floating_preview=1
let g:ale_hover_to_floating_preview=1
let g:ale_floating_window_border=['│', '─', '╭', '╮', '╯', '╰', '│', '─']
let g:ale_set_quickfix=1
let g:ale_linters = {
\   'python': ['flake8', 'mypy', 'jedils']
\}
let g:ale_fixers = {
\   'python': ['black']
\}
" Mappings needed for ALE?
" By defaule, [l, ]l navigate between linter errors/warnings
nnoremap <Leader>ld :<C-u>ALEGoToDefinition<CR>
nnoremap <Leader>lr :<C-u>ALERename<CR>
nnoremap <Leader>lt :<C-u>ALEGoToTypeDefinition<CR>
nnoremap <Leader>lh :<C-u>ALEHover<CR>
nnoremap <Leader>lf :<C-u>ALEFindReferences -quickfix<CR>:copen<CR>
" Auto hover? Can configure per filetype. Off for now as too distracting
"autocmd CursorHold *.py :ALEHover
"""" Info buffer (in development)
let g:inspector_buffer_name='Inspector'
function! CreateInspector()
    "" TODO special logic here for placement etc
    exec 'split '.g:inspector_buffer_name
endfunction
function! SetInspectorContent(content)
    if bufnr(g:inspector_buffer_name) < 0
        "Buffer doesn't exist, open it
        call CreateInspector()
    else 
        call setbufvar(g:inspector_buffer_name, '&readonly', 0)
        call setbufvar(g:inspector_buffer_name, '&modifiable', 1)
        call deletebufline(g:inspector_buffer_name, 1, '$')
    endif
    call setbufline(g:inspector_buffer_name, 1, a:content)
    call setbufvar(g:inspector_buffer_name, '&readonly', 1)
    call setbufvar(g:inspector_buffer_name, '&modifiable', 0)
    call setbufvar(g:inspector_buffer_name, '&modified', 0)
endfunction
function! InspectorHijackBuffer(name)
    call SetInspectorContent(getbufline(a:name,1,'$'))
    exec 'bdelete '.bufnr(a:name)
endfunction
function! InspectorHijackDelayed(name)
    let s:old_eventignore = &eventignore
    set eventignore=all
    call timer_start(1, {-> InspectorHijackBuffer(a:name)})
    let &eventignore = s:old_eventignore
endfunction
"Enable the above with this line:
"autocmd BufCreate ALEPreviewWindow :call InspectorHijackDelayed('ALEPreviewWindow')

"" Other
"Compilation
autocmd BufWritePost ~/.scripts/folders,~/.scripts/configs !bash ~/.scripts/shortcuts.sh
"autocmd BufWritePost *.{js,html,css} silent !firefox-refresh
function! VimuxComp()
    call VimuxSendKeys("C-c")
    call VimuxRunLastCommand()
endfunction
map <C-c> :call VimuxComp()<CR>
map <C-z> :exe getline('.')[2:]<CR>

"execute pathogen#infect()
"call pathogen#helptags()

"" Local config files
silent! so .vimlocal

"" Deprecated
" Things that I have commented out over the years and am too scared to delete
" in case they become useful. (These predate version control usage.)

"syntax:
"markdown (LaTeX in $s)... not working right now?
"au BufNewFile,BufFilePre,BufRead *.md syn region math start=/\$\$/ end=/\$\$/
"au BufNewFile,BufFilePre,BufRead *.md syn match math '\$[^$].\{-}\$'
"au BufNewFile,BufFilePre,BufRead *.md hi link math Statement

"augroup vimrc
"    au!
"    au nmap <Leader>ll <Plug>Tex_Compile<CR>
"    au VimEnter * unmap <C-J>
"    au VimEnter * nnoremap <C-J> :wincmd j<CR>
"    au VimEnter * nnoremap <C-G> <Plug>IMAP_JUMPForward
"    au VimEnter * inoremap <C-G> <Plug>IMAP_JUMPForward
"augroup end

" Custom forward search for zathura
"function! SyncTexForward()
"    let execstr = 'silent! !zathura --synctex-forward '.line('.').':1:'.shellescape(expand("%:p:r")).'.pdf'
"    execute execstr
"endfunction

"" Vimscript and local config
" vim:ft=vim
