return {
    "olimorris/codecompanion.nvim",
    dependencies = {
        "nvim-lua/plenary.nvim",
        "nvim-treesitter/nvim-treesitter",
    },
    opts = {
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
                    })           -- Removed openrouter adapter as it's not available
                end
            }
        },
        strategies = {
            chat = {
                adapter = "openrouter_mistral",
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
        },
        opts = {
            log_level = "DEBUG", -- or "TRACE"
        },
    },
}
