--
--  ███╗   ██╗███████╗ ██████╗ ██╗   ██╗██╗███╗   ███╗
--  ████╗  ██║██╔════╝██╔═══██╗██║   ██║██║████╗ ████║
--  ██╔██╗ ██║█████╗  ██║   ██║██║   ██║██║██╔████╔██║
--  ██║╚██╗██║██╔══╝  ██║   ██║╚██╗ ██╔╝██║██║╚██╔╝██║
--  ██║ ╚████║███████╗╚██████╔╝ ╚████╔╝ ██║██║ ╚═╝ ██║
--  ╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═══╝  ╚═╝╚═╝     ╚═╝
--
-- Author: Harry Cooke

-- Load plugins
require("config.lazy")

-- Colour scheme customisations
require("config.colours")

-- Source vimscript config
vim.cmd('source ~/.config/nvim/legacy.vim')

-- WSL config
local is_wsl = vim.fn.has("unix") == 1 and (vim.fn.systemlist("uname -r")[1] or ""):match("Microsoft")
if is_wsl then
    require("config.wsl")
end

-- Git tooling
require("config.git").setup({})

vim.keymap.set("n", "<Leader>fp", "<cmd>silent !tmux neww tmux-sessionizer<CR>")

vim.keymap.set("n", "<Leader>cc", function()
  vim.cmd("silent make")
  vim.cmd("copen")
end, { desc = "Run make and open quickfix" })
