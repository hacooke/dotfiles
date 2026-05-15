require("nvim-treesitter").setup({
    ensure_installed = {
        "lua",
        "vim",
        "vimdoc",
        "python",
        "bash",
        "c",
        "cpp",
        "javascript",
        "typescript",
        "html",
        "css",
        "json",
        "yaml",
        "markdown",
        "markdown_inline",
        "rust",
    },
    auto_install = true,
    sync_install = false,
})

vim.api.nvim_create_autocmd("FileType", {
    callback = function()
        local ok, _ = pcall(vim.treesitter.start)
        if not ok then
            return
            -- No parser for this filetype, that's fine
        end
        vim.schedule(function()
            vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
        end)
    end,
})

require("nvim-treesitter-textobjects").setup({
    select = {
        lookahead = true,
        include_surrounding_whitespace = true,
    },
    move = {
        set_jumps = true,
    },
})

local select = require("nvim-treesitter-textobjects.select")
vim.keymap.set({ "x", "o" }, "af", function() select.select_textobject("@function.outer", "textobjects") end,
    { desc = "Select outer function" })
vim.keymap.set({ "x", "o" }, "if", function() select.select_textobject("@function.inner", "textobjects") end,
    { desc = "Select inner function" })
vim.keymap.set({ "x", "o" }, "ac", function() select.select_textobject("@class.outer", "textobjects") end,
    { desc = "Select outer class" })
vim.keymap.set({ "x", "o" }, "ic", function() select.select_textobject("@class.inner", "textobjects") end,
    { desc = "Select inner class" })
vim.keymap.set({ "x", "o" }, "aa", function() select.select_textobject("@parameter.outer", "textobjects") end,
    { desc = "Select outer parameter" })
vim.keymap.set({ "x", "o" }, "ia", function() select.select_textobject("@parameter.inner", "textobjects") end,
    { desc = "Select inner parameter" })
vim.keymap.set({ "x", "o" }, "as", function() select.select_textobject("@local.scope", "locals") end,
    { desc = "Select scope" })

local swap = require("nvim-treesitter-textobjects.swap")
vim.keymap.set("n", "<leader>sa", function() swap.swap_next("@parameter.inner") end, { desc = "Swap next parameter" })
vim.keymap.set("n", "<leader>sf", function() swap.swap_next("@function.outer") end, { desc = "Swap next function" })
vim.keymap.set("n", "<leader>sA", function() swap.swap_previous("@parameter.inner") end, { desc = "Swap prev parameter" })
vim.keymap.set("n", "<leader>sF", function() swap.swap_previous("@function.outer") end, { desc = "Swap prev function" })

local move = require("nvim-treesitter-textobjects.move")
vim.keymap.set({ "n", "x", "o" }, "]m", function() move.goto_next_start("@function.outer", "textobjects") end,
    { desc = "Next function start" })
vim.keymap.set({ "n", "x", "o" }, "[m", function() move.goto_previous_start("@function.outer", "textobjects") end,
    { desc = "Prev function start" })

vim.filetype.add({
    extension = {
        ino = "cpp",
    },
})
