return {
  "lukas-reineke/indent-blankline.nvim",
  main = "ibl",
  opts = {
    indent = {
      char = "│",
      tab_char = "│",
    },
    scope = {
      enabled = false,
    },
    exclude = {
      filetypes = {
        -- "help",
        -- "terminal",
        -- "lazy",
        -- "lspinfo",
        -- "TelescopePrompt",
        -- "TelescopeResults",
        -- "mason",
        -- "nvim-tree",
        -- "neo-tree",
        -- "tex",
      },
    },
  },
}
