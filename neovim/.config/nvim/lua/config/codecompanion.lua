vim.env["CODECOMPANION_TOKEN_PATH"] = vim.fn.expand("~/.config")

vim.keymap.set({ "n", "v" }, "<Leader>aa", function()
    require("codecompanion").toggle()
end, { desc = "Toggle CodeCompanion Chat", silent = true })

vim.keymap.set({ "n", "v" }, "<Leader>an", function()
    vim.cmd("CodeCompanionChat adapter=copilot model=gpt-5-mini")
end, { desc = "New CodeCompanion Chat", silent = true })

vim.keymap.set("v", "<Leader>ay", function()
    vim.cmd("CodeCompanionChat Add")
end, { desc = "New CodeCompanion Chat", silent = true })

vim.keymap.set({ "n", "v" }, "<leader>af", function()
    vim.cmd("CodeCompanionActions")
end, { desc = "Open CodeCompanion Actions", silent = true })

vim.keymap.set({ "v", "x" }, "<leader>ai", function()
    require("codecompanion").prompt("implement")
end, { desc = "Implement selected function (CodeCompanion prompt: /implement)" })

-- Expand 'cc' into 'CodeCompanion' in the command line
vim.cmd([[cab cc CodeCompanion]])

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
                        default = "gpt-5-mini",
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
        },
        ollama = function()
            return require("codecompanion.adapters").extend("ollama", {
                env = {
                    url = "http://localhost:11434",
                },
                schema = {
                    model = {
                        -- Recommended for agentic tool use
                        default = "qwen2.5-coder:32b-instruct",
                        -- Alternative if you want stock
                        -- default = "deepseek-coder-v2:16b-lite-instruct",
                    },
                },
            })
        end,
    },
    strategies = {
        chat = { adapter = "copilot", model = "gpt-5-mini" },
        inline = { adapter = "copilot", model = "gpt-5-mini" },
        agent = { adapter = "copilot", model = "gpt-5-mini" },
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
                        "indent-heuristic",    -- https://blog.k-nut.eu/better-git-diffs
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
    prompt_library = {
        markdown = {
            dirs = {
                vim.fn.stdpath("config") .. "/prompts",
            },
        },
    },
    rules = {
        caveman = {
            description = "Why use many token when few token do trick",
            files = {
                "~/.config/nvim/prompts/rules/caveman.md",
            },
        },
    },
    interactions = {
        chat = {
            opts = {
                system_prompt = function(ctx)
                    return fmt([[You are "CodeCompanion", an AI coding agent inside Neovim.
Follow user requirements to the letter.
Keep all answers short, impersonal, and telegraphic.
Use the context and attachments the user provides.
Use Markdown formatting. No H1/H2 headers.
When suggesting code changes or new content, use Markdown code blocks (4 backticks, labelled with language).
If the code modifies an existing file or should be placed at a specific location, add a line comment with 'filepath:' and the file path.
Do not include line numbers in code blocks.

Additional context:
The current date is %s.
The user's Neovim version is %s.
The user is working on a %s machine. Please respond with system specific commands if applicable.]],
                        ctx.date,
                        ctx.nvim_version,
                        ctx.os
                    )
                end,
            },
        },
    },
}
