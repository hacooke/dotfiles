require("copilot").setup({
  suggestion = { enabled = false }, -- Disable ghost text
  panel = { enabled = false },      -- Disable the separate panel
})

-- 2. Setup the cmp bridge
require("copilot_cmp").setup()

-- 3. Add to your nvim-cmp sources
require("cmp").setup({
  sources = {
    { name = "nvim_lsp", group_index = 2 },
    { name = "path", group_index = 2 },
    { name = "copilot", group_index = 2 },
    { name = "buffer", group_index = 2 },
  },
})
