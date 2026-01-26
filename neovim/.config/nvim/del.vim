" Deleted content from init.vim (perhaps to be reused?)
"
"" Packages
" NOTE: Use a plugin manager like vim-plug, packer.nvim, or lazy.nvim
" Example with vim-plug (install from https://github.com/junegunn/vim-plug):
"
" call plug#begin('~/.local/share/nvim/plugged')
" Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
" Plug 'junegunn/fzf.vim'
" Plug 'itchyny/lightline.vim'
" Plug 'preservim/nerdtree'
" Plug 'Xuyuanp/nerdtree-git-plugin'
" Plug 'airblade/vim-gitgutter'
" Plug 'Yggdroot/indentLine'
" Plug 'dense-analysis/ale'
" Plug 'tpope/vim-fugitive'
" Plug 'preservim/vimux'
" call plug#end()

""" vim-fugitive
function! s:git_merge_base() abort
    " find common ancestor of head and origin ? origin/main?
    return FugitiveExecute(['merge-base', 'origin/main', 'HEAD']).stdout[0]
endfunction

" Review all changed files
nmap <leader>gr :<C-u>Git difftool -y <C-r>=<SID>git_merge_base()<CR><CR>
" Create quickfix list of changed files
nmap <leader>gf :<C-u>Git difftool --name-only <C-r>=<SID>git_merge_base()<CR><CR>
" Diff file with merge base
nmap <leader>gD :<C-u>Gvdiffsplit! <C-r>=<SID>git_merge_base()<CR><CR>

""" fzf.vim
set runtimepath+=~/.fzf
nnoremap <Leader>ff :<C-u>Files<CR>
nnoremap <Leader>fb :<C-u>Buffers<CR>
nnoremap <Leader>fg :<C-u>GFiles<CR>
nnoremap <Leader>fh :<C-u>History<CR>
nnoremap <Leader>f/ :<C-u>History/<CR>
nnoremap <Leader>fc :<C-u>Commits<CR>

""" lightline.vim
set laststatus=2
set noshowmode

" Filenames which should show reduced lightline bar
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
            let mark = ' '
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
" Colorscheme in autoload/lightline/colorscheme/hc.vim
" Separators add powerline symbols

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
highlight GitGutterDelete ctermbg=None ctermfg=1
set updatetime=1000

""" indentLine
let g:indentLine_color_term = 238
let g:indentLine_char = '│'
let g:indentLine_fileTypeExclude=['tex']

