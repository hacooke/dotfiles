vim.opt_local.makeprg = "cargo check --all-targets --all-features --message-format short"

vim.keymap.set("n", "<Leader>cl", function()
    -- Override makeprg temporarily
    local old = vim.opt_local.makeprg
    vim.opt_local.makeprg = "cargo clippy --all-targets --all-features --message-format short"
    vim.cmd("silent make")
    vim.cmd("copen")
    vim.opt_local.makeprg = old
end, { buffer = true, desc = "Cargo clippy (quickfix)" })
