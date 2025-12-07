return {
    'nvim-lualine/lualine.nvim',
    dependencies = {
        'nvim-tree/nvim-web-devicons',
        'tpope/vim-fugitive',
    },
    config = function()
        require('config.lualine')
    end,
}
