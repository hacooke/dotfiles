return {
    {
        "stevearc/conform.nvim",
        event = { "BufWritePre" },
        cmd = { "ConformInfo" },
        opts = {
            formatters_by_ft = {
                python = { "ruff_format", "ruff_organize_imports" },
                lua = { "stylua" },
                javascript = { "prettier" },
                typescript = { "prettier" },
                json = { "prettier" },
                yaml = { "prettier" },
                markdown = { "prettier" },
                bash = { "shfmt" },
                sh = { "shfmt" },
            },
            format_on_save = false,--{
            --     timeout_ms = 1000,
            --     lsp_fallback = true,
            -- },
            formatters = {
                ruff_format = {
                    command = "ruff",
                    args = { "format", "--stdin-filename", "$FILENAME", "-" },
                    stdin = true,
                },
                ruff_organize_imports = {
                    command = "ruff",
                    args = { "check", "--select", "I", "--fix", "--stdin-filename", "$FILENAME", "-" },
                    stdin = true,
                },
            },
        },
        keys = {
            {
                "<Leader>lm",
                function()
                    require("conform").format({ async = true, lsp_fallback = true })
                end,
                mode = "",
                desc = "Format buffer with conform",
            },
        },
    },
}
