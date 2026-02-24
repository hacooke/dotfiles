return {
    {
        "stevearc/conform.nvim",
        event = { "BufWritePre" },
        cmd = { "ConformInfo" },
        opts = {
            formatters_by_ft = {
                python = { "ruff_format", "ruff_organize_imports" },
                lua = { "stylua" },
                c = { "clang_format" },
                cpp = { "clang_format" },
                rust = { "rustfmt" },
                javascript = { "prettier" },
                typescript = { "prettier" },
                json = { "prettier" },
                yaml = { "prettier" },
                markdown = { "prettier" },
                bash = { "shfmt" },
                sh = { "shfmt" },
            },
            format_on_save = false, --{
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
                    condition = function()
                        return false
                    end,
                },
                rustfmt = {
                    command = "rustfmt",
                    args = {
                        "--config", "edition=2024",
                        "--emit", "stdout",
                        "--quiet",
                    },
                    stdin = true,
                    -- Optional: Use rustfmt config file if it exists
                    -- rustfmt will automatically look for rustfmt.toml or .rustfmt.toml
                    -- in the project root or use these inline options
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
