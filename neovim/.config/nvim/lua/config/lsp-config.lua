local border = "rounded"

local capabilities = require("cmp_nvim_lsp").default_capabilities()

local default_config = {
    capabilities = capabilities,
}

vim.lsp.config('*', default_config)

vim.lsp.config.lua_ls = {
    cmd = { "lua-language-server" },
    filetypes = { "lua" },
    root_markers = { ".luarc.json", ".luarc.jsonc", ".luacheckrc", ".stylua.toml", "stylua.toml", "selene.toml", "selene.yml", ".git" },
    capabilities = capabilities,
    settings = {
        Lua = {
            runtime = { version = "LuaJIT" },
            diagnostics = {
                globals = { "vim" },
            },
            workspace = {
                library = vim.api.nvim_get_runtime_file("", true),
                checkThirdParty = false,
            },
            telemetry = { enable = false },
        },
    },
}

vim.lsp.config.basedpyright = {
    cmd = { "basedpyright-langserver", "--stdio" },
    filetypes = { "python" },
    root_markers = { "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt", "Pipfile", "pyrightconfig.json", ".git" },
    capabilities = capabilities,
    settings = {
        basedpyright = {
            analysis = {
                typeCheckingMode = "standard", -- "off", "basic", "standard", "strict", "all"
                autoSearchPaths = true,
                useLibraryCodeForTypes = true,
                diagnosticMode = "workspace", -- or "openFilesOnly"
                autoImportCompletions = true,
            },
        },
    },
}

vim.lsp.config.clangd = {
    cmd = {
        "clangd",
        "--background-index",
        "--clang-tidy",
        "--header-insertion=iwyu",
        "--completion-style=detailed",
        "--function-arg-placeholders",
        "--fallback-style=llvm",
        -- Add Arduino-specific flags
        "--query-driver=/usr/bin/avr-g++,/usr/bin/arm-none-eabi-g++",
    },
    filetypes = { "c", "cpp", "objc", "objcpp", "cuda", "proto" },
    root_markers = {
        ".clangd",
        ".clang-tidy",
        ".clang-format",
        "compile_commands.json",
        "compile_flags.txt",
        "configure.ac",
        ".git",
    },
    capabilities = vim.tbl_deep_extend(
        "force",
        capabilities,
        {
            offsetEncoding = { "utf-16" }, -- clangd uses utf-16
        }
    ),
    init_options = {
        clangdFileStatus = true,
        usePlaceholders = true,
        completeUnimported = true,
        semanticHighlighting = true,
    },
}

vim.lsp.config.rust_analyzer = {
    cmd = { "rust-analyzer" },
    filetypes = { "rust" },
    root_markers = { "Cargo.toml", "rust-project.json", ".git" },
    capabilities = capabilities,
    settings = {
        ["rust-analyzer"] = {
            lruCapacity = 512,
            cargo = {
                allFeatures = true,
                loadOutDirsFromCheck = false,
                buildScripts = {
                    enable = false,
                },
            },
            check = {
                command = "check",
            },
            procMacro = {
                enable = true,
            },
            diagnostics = {
                enable = true,
                experimental = {
                    enable = true,
                },
            },
            inlayHints = {
                enable = true,
                chainingHints = true,
                typeHints = true,
                parameterHints = true,
            },
        },
    },
}

vim.lsp.config.ruff = {
    cmd = { "ruff", "server" },
    filetypes = { "python" },
    root_markers = { "pyproject.toml", "ruff.toml", ".ruff.toml", ".git" },
    capabilities = capabilities,
}

vim.lsp.config.bashls = {
    cmd = { "bash-language-server", "start" },
    filetypes = { "sh", "bash" },
    root_markers = { ".git" },
    capabilities = capabilities,
}

vim.lsp.config.jsonls = {
    cmd = { "vscode-json-language-server", "--stdio" },
    filetypes = { "json", "jsonc" },
    root_markers = { ".git" },
    capabilities = capabilities,
}

vim.lsp.config.yamlls = {
    cmd = { "yaml-language-server", "--stdio" },
    filetypes = { "yaml", "yml" },
    root_markers = { ".git" },
    capabilities = capabilities,
}

vim.lsp.enable({
    "lua_ls",
    "basedpyright",
    "ruff",
    "bashls",
    "jsonls",
    "yamlls",
    "clangd",
    "rust_analyzer",
    --"arduino_language_server",
})

-- Keymaps
vim.api.nvim_create_autocmd("LspAttach", {
    callback = function(args)
        local opts = { buffer = args.buf, silent = true }

        vim.keymap.set("n", "<Leader>ld", vim.lsp.buf.definition, opts)
        vim.keymap.set("n", "<Leader>lr", vim.lsp.buf.rename, opts)
        vim.keymap.set("n", "<Leader>lt", vim.lsp.buf.type_definition, opts)
        vim.keymap.set("n", "<Leader>lh", function()
            vim.lsp.buf.hover({ border = border })
        end, opts)
        vim.keymap.set("n", "<Leader>lf", vim.lsp.buf.references, opts)
        vim.keymap.set("n", "<Leader>la", vim.lsp.buf.code_action, opts)
        vim.keymap.set("n", "<Leader>le", vim.diagnostic.open_float, opts)
        vim.keymap.set("n", "<leader>li", function()
            vim.lsp.inlay_hint.enable(
                not vim.lsp.inlay_hint.is_enabled()
            )
        end, { desc = "Toggle inlay hints" })
        vim.keymap.set("n", "<Leader>lq", vim.diagnostic.setqflist, opts)
    end,
})

vim.diagnostic.config({
    virtual_text = {
        prefix = "●",
        source = "if_many",
    },
    float = {
        border = border,
        source = true,
    },
    signs = {
        text = {
            [vim.diagnostic.severity.ERROR] = "", -- nf-cod-error
            [vim.diagnostic.severity.WARN] = "", -- nf-fa-exclamation_triangle
            [vim.diagnostic.severity.HINT] = "", -- nf-fa-lightbulb_o
            [vim.diagnostic.severity.INFO] = "", -- nf-fa-info_circle
        },
    },
    underline = true,
    update_in_insert = false,
    severity_sort = true,
})
