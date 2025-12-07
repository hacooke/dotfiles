require('lualine').setup {
  options = {
    icons_enabled = true,
    theme = 'auto',--transparent_middle(require('lualine.themes.auto')),
    component_separators = { left = '', right = '' },
    section_separators = { left = '', right = '' },

    disabled_filetypes = {
      statusline = { 'NvimTree', 'nerdtree' },
      winbar = {},
    },
    ignore_focus = {},
    always_divide_middle = true,
    globalstatus = false,
    refresh = {
      statusline = 1000,
      tabline = 1000,
      winbar = 1000,
    }
  },
  sections = {
    lualine_a = {'mode'},
    lualine_b = {
      {
        'branch',
        icon = '',
      },
      'diff',
      {
        'filename',
        file_status = true,     -- Shows modified/readonly status
        path = 0,               -- 0: Just filename
        shorting_target = 40,
        symbols = {
          modified = '+',
          readonly = 'RO',
          unnamed = '[No Name]',
        }
      }
    },
    lualine_c = {},
    lualine_x = {
      {
        'diagnostics',
        sources = { 'nvim_diagnostic', 'ale' },
        sections = { 'error', 'warn' },
        symbols = {
          error = 'E',
          warn = 'W',
          info = 'I',
          hint = 'H'
        },
        colored = true,
        update_in_insert = false,
        always_visible = false,
      },
      'filetype',
    },
    lualine_y = {'progress'},
    lualine_z = {'location'}
  },
  inactive_sections = {
    lualine_a = {},
    lualine_b = {},
    lualine_c = {'filename'},
    lualine_x = {'location'},
    lualine_y = {},
    lualine_z = {}
  },
  tabline = {},
  winbar = {},
  inactive_winbar = {},
  extensions = { 'fugitive', 'fzf', 'quickfix' }
}
