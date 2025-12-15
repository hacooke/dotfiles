local builtin = require('telescope.builtin')
vim.keymap.set('n', '<leader>ff', builtin.find_files, { desc = 'Telescope find files' })
vim.keymap.set('n', '<leader>fg', builtin.live_grep, { desc = 'Telescope live grep' })
vim.keymap.set('n', '<leader>fb', builtin.buffers, { desc = 'Telescope buffers' })
vim.keymap.set('n', '<leader>fh', builtin.help_tags, { desc = 'Telescope help tags' })
vim.keymap.set('n', '<leader>fc', builtin.git_commits, { desc = 'Telescope git commits' })
vim.keymap.set('n', '<leader>fx', builtin.git_branches, { desc = 'Telescope git branches' })
vim.keymap.set('n', '<leader>fq', builtin.quickfix, { desc = 'Telescope quickfix' })
vim.keymap.set('n', '<leader>fw', builtin.quickfixhistory, { desc = 'Telescope quickfix history' })
vim.keymap.set('n', '<leader>ft', builtin.builtin, { desc = 'Telescope builtin searches' })
vim.keymap.set('n', '<leader>fr', builtin.registers, { desc = 'Telescope registers' })
vim.keymap.set('n', '<leader>f:', builtin.commands, { desc = 'Telescope commands' })
vim.keymap.set('n', '<leader>fv', builtin.vim_options, { desc = 'Telescope vim options' })
vim.keymap.set('n', '<leader>fj', builtin.jumplist, { desc = 'Telescope jumplist' })
vim.keymap.set('n', '<leader>f/', builtin.search_history, { desc = 'Telescope search history' })
vim.keymap.set('n', '<leader>fm', builtin.marks, { desc = 'Telescope marks' })
vim.keymap.set('n', '<leader>fe', builtin.diagnostics, { desc = 'Telescope diagnostic errors' })
vim.keymap.set('n', '<leader>fa', function()
    builtin.find_files({ no_ignore = true, follow = true })
end, { desc = 'Telescope find all files' })

-- Integrate telescope with fugitive
local actions = require('telescope.actions')
local action_state = require('telescope.actions.state')
require('telescope').setup({
    pickers = {
        git_commits = {
            attach_mappings = function(prompt_bufnr, map)
                -- replace <CR> behaviour
                map('i', '<CR>', function()
                    local entry = action_state.get_selected_entry()
                    actions.close(prompt_bufnr)
                    vim.cmd('Gedit ' .. entry.value)
                end)

                -- also override for normal mode inside telescope
                map('n', '<CR>', function()
                    local entry = action_state.get_selected_entry()
                    actions.close(prompt_bufnr)
                    vim.cmd('Gedit ' .. entry.value)
                end)

                return true
            end
        },
        find_files = {
            hidden = true,
            no_ignore = false,
        },
    },
})
