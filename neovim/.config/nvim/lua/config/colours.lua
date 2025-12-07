vim.cmd[[colorscheme tokyonight-storm]]
-- -- Transparent background
-- vim.g.transparent_background = 1
-- function _G.transparent_background()
--     if vim.g.transparent_background == 0 then
--         return
--     end

--     local highlights = {
--         'Normal',
--         'NormalNC',
--         'NormalFloat',
--         'NormalSB',
--         'StatusLine',
--         'NonText',
--         'LineNr',
--         'SignColumn',
--         'EndOfBuffer',
--         'Folded',
--         -- 'lualine_c_normal',
--         -- 'lualine_c_insert',
--         -- 'lualine_c_visual',
--         -- 'lualine_c_replace',
--         -- 'lualine_c_command',
--         -- 'lualine_c_inactive',
--     }

--     for _, name in ipairs(highlights) do
--         vim.api.nvim_set_hl(0, name, { bg = 'NONE', ctermbg = 'NONE' })
--     end

-- end

-- transparent_background()

-- vim.api.nvim_create_autocmd('ColorScheme', {
--     pattern = '*',
--     callback = transparent_background,
--     -- callback = function()
--     --     transparent_background()
--     --     -- Also defer to run after lualine updates
--     --     vim.defer_fn(transparent_background, 100)
--     -- end,
-- })
