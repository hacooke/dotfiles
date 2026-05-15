return {
    {
        "nvim-treesitter/nvim-treesitter",
        lazy = false,
        build = ":TSUpdate",
    },
    {
        "nvim-treesitter/nvim-treesitter-textobjects",
        lazy = false,
        dependencies = "nvim-treesitter/nvim-treesitter",
        config = function()
            require("config.treesitter")
        end,
    },
}
