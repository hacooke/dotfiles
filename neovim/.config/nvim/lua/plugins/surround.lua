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
        keymaps = {
            insert = "<C-g>s",
            insert_line = "<C-g>S",
            normal = "ys",
            normal_cur = "yss",
            normal_line = "yS",
            normal_cur_line = "ySS",
            visual = "S",
            visual_line = "gS",
            delete = "ds",
            change = "cs",
            change_line = "cS",
        },
    },
}
