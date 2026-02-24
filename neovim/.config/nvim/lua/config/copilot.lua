require("copilot").setup({
    suggestion = { enabled = false }, -- Disable ghost text
    panel = { enabled = false },      -- Disable the separate panel
})

-- 2. Setup the cmp bridge
require("copilot_cmp").setup()

-- 3. Add to your nvim-cmp sources
cmp = require("cmp")
cmp.setup({
    sources = {
        { name = "nvim_lsp", group_index = 1 },
        { name = "path", group_index = 1 },
        { name = "copilot", group_index = 2 },
        {
            name = "buffer",
            group_index = 3,
            option = {
                get_bufnrs = function()
                    return vim.api.nvim_list_bufs()
                end,
            }
        },
    },
    window = {
        completion = cmp.config.window.bordered {
            border = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" }
        },
        documentation = cmp.config.window.bordered {
            border = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" },
        },
    },
    preselect = cmp.PreselectMode.None,
    mapping = {
        ["<CR>"] = cmp.mapping.confirm({ select = false }),
    }
})
