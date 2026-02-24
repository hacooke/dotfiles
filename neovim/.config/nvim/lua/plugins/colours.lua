return {
    {
        "catppuccin/nvim",
        name = "catppuccin",
        priority = 1000,
        opts = {
            transparent_background = true,
            integrations = {
                telescope = true,
                native_lsp = { enabled = true },
                which_key = true,
                noice = true,
                cmp = true,
                treesitter = true,
                gitsigns = true,
            },
            color_overrides = {},
            custom_highlights = function(colors)
                return {
                    NormalFloat     = { bg = "NONE" },
                    FloatBorder     = { bg = "NONE" },
                    TelescopeNormal = { link = "Normal" },
                    TelescopeBorder = { link = "FloatBorder" },
                    TabLineSel      = { bg = colors.base },
                    TabLine         = { bg = "NONE" },
                    WinSeparator    = { link = "FloatBorder" },
                }
            end,
        }
    },
    {
        "folke/tokyonight.nvim",
        lazy = false,
        priority = 1000,
        opts = {
            transparent = true,
            on_colors = function(colors)
                colors.bg_statusline = 'NONE'
            end,
            on_highlights = function(highlights, colors)
                highlights.LineNr = { fg = colors.red }
            end,
        },
    },
}
