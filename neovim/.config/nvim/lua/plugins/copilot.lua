return {
    "zbirenbaum/copilot.lua",
    dependencies = {
        "zbirenbaum/copilot-cmp"
    },
    config = function()
        require("config.copilot")
    end,
    cmd = "Copilot",
}
