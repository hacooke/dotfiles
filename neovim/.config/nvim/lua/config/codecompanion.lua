vim.env["CODECOMPANION_TOKEN_PATH"] = vim.fn.expand("~/.config")

vim.keymap.set("n", "<Leader>aa", function()
    require("codecompanion").toggle()
end, { desc = "Toggle CodeCompanion Chat", silent = true })

vim.keymap.set("n", "<Leader>an", function()
    vim.cmd("CodeCompanionChat")
end, { desc = "New CodeCompanion Chat", silent = true })

vim.keymap.set({"n", "v"}, "<leader>af", function()
    vim.cmd("CodeCompanionActions")
end, { desc = "Open CodeCompanion Actions", silent = true })

vim.keymap.set({"v", "x"}, "<leader>ai", function()
    require("codecompanion").prompt("implement")
end, { desc = "Implement selected function (CodeCompanion prompt: /implement)" })

require("codecompanion").setup {
    adapters = {
        gemini = function()
            return require("codecompanion.adapters").extend("gemini", {
                schema = {
                    model = {
                        --default = "gemini-1.5-pro",
                        default = "gemini-2.0-flash-exp",
                    },
                },
            })
        end,
        copilot = function()
            return require("codecompanion.adapters").extend("copilot", {
                schema = {
                    model = {
                        default = "gpt-4o",
                    },
                },
            })
        end,
        http = {
            openrouter_mistral = function()
                return require("codecompanion.adapters").extend("openai_compatible", {
                    env = {
                        url = "https://openrouter.ai/api",
                        api_key = "OPENROUTER_API_KEY",
                        chat_url = "/v1/chat/completions",
                    },
                    schema = {
                        model = {
                            default = "mistralai/devstral-2512:free",
                        },
                    },
                })
            end
        }
    },
    strategies = {
        chat = {
            adapter = "copilot",
        },
        inline = {
            adapter = "copilot",
        },
        agent = {
            adapter = "copilot",
        },
    },
    display = {
        chat = {
            window = {
                layout = "vertical",
                width = 0.45,
            },
        },
        diff = {
            provider_opts = {
                split = {
                    close_chat_at = 240, -- Close an open chat buffer if the total columns of your display are less than...
                    layout = "vertical", -- vertical|horizontal split
                    opts = {
                        "internal",
                        "filler",
                        "closeoff",
                        "algorithm:histogram", -- https://adamj.eu/tech/2024/01/18/git-improve-diff-histogram/
                        "indent-heuristic", -- https://blog.k-nut.eu/better-git-diffs
                        "followwrap",
                        "linematch:120",
                    },
                },
            },
        },
    },
    opts = {
        log_level= "DEBUG", -- or "TRACE"
    },
    prompt_library = {
        markdown = {
            dirs = {
                vim.fn.stdpath("config") .. "/prompts",
            },
        },
    },
}
