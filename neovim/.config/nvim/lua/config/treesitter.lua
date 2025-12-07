require("nvim-treesitter.configs").setup({
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
    highlight = {
        enable = true,
        -- Disable for large files
        disable = function(lang, buf)
            local max_filesize = 100 * 1024 -- 100 KB
            local ok, stats = pcall(vim.loop.fs_stat, vim.api.nvim_buf_get_name(buf))
            if ok and stats and stats.size > max_filesize then
                return true
            end
        end,
        additional_vim_regex_highlighting = false,
    },
    indent = {
        enable = true,
    },
    incremental_selection = {
        enable = true,
        keymaps = {
            init_selection = "<CR>",
            node_incremental = "<CR>",
            scope_incremental = "<S-CR>",
            node_decremental = "<BS>",
        },
    },
    textobjects = {
        select = {
            enable = true,
            lookahead = true,
            keymaps = {
                ["af"] = { query = "@function.outer", desc = "Select inner part of a function region" },
                ["if"] = { query = "@function.inner", desc = "Select inner part of a function region" },
                ["ac"] = { query = "@class.outer", desc = "Select inner part of a class region" },
                ["ic"] = { query = "@class.inner", desc = "Select inner part of a class region" },
                ["as"] = { query = "@local.scope", query_group = "locals", desc = "Select language scope" },
                ["aa"] = { query = "@parameter.outer", desc = "Select inner part of a parameter region" },
                ["ia"] = { query = "@parameter.inner", desc = "Select inner part of a parameter region" },
            },
            include_surrounding_whitespace = true,
        },
        swap = {
            enable = true,
            swap_next = {
                ["<leader>sa"] = "@parameter.inner",
                ["<leader>sf"] = "@function.outer",
            },
            swap_previous = {
                ["<leader>sA"] = "@parameter.inner",
                ["<leader>sF"] = "@function.outer",
            },
        },
    },
})

