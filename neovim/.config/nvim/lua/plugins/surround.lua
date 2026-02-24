return {
    "kylechui/nvim-surround",
    version = "*",
    event = "VeryLazy",
    opts = {
        -- Default keymaps:
        -- ys{motion}{char} - add surround
        -- ds{char} - delete surround
        -- cs{target}{replacement} - change surround
        -- Visual mode: S{char} - surround selection
    },
}
