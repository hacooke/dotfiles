vim.env["CODECOMPANION_TOKEN_PATH"] = vim.fn.expand("~/.config")
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
            model = "mistralai/devstral-2512:free",
        },
        inline = {
            adapter = "openrouter_mistral",
            model = "mistralai/devstral-2512:free",
        },
        agent = {
            adapter = "openrouter_mistral",
            model = "mistralai/devstral-2512:free",
            tools = {
                ["editor"] = { enabled = true },
                ["files"] = { enabled = true },
            },
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
        log_level = "DEBUG", -- or "TRACE"
    },
}
