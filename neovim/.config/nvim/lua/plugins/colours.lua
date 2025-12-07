return {
    {
        "catppuccin/nvim", name = "catppuccin", priority = 1000,
        opts = {
            transparent_background = 1
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
