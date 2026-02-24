local M = {}

local cfg = {
    default_base = "origin/main", -- default remote base
    use_merge_base = true,        -- when true, resolve merge-base(base, HEAD)
    notifications = true,
}

-- --- Utilities --------------------------------------------------------------

local function notify(msg, level)
    if cfg.notifications then
        vim.notify(msg, level or vim.log.levels.INFO, { title = "GitDiff" })
    end
end

local function has_fugitive()
    -- 2 means user command exists
    return vim.fn.exists(":Git") == 2 and vim.fn.exists(":Gvdiffsplit") == 2
end

local function run_git(args)
    -- returns { ok:boolean, out:table<string>, code:number }
    local cmd = { "git" }
    vim.list_extend(cmd, args or {})
    local out = vim.fn.systemlist(cmd)
    local code = vim.v.shell_error
    return code == 0, out, code
end

local function git_merge_base(base)
    base = base or cfg.default_base
    local ok, out = run_git({ "merge-base", base, "HEAD" })
    if not ok or #out == 0 then
        notify("Failed to compute merge-base for " .. base, vim.log.levels.ERROR)
        return nil
    end
    return out[1]
end

local function resolve_target(opts)
    opts = opts or {}
    local target = opts.target or cfg.default_base
    local use_mb = (opts.use_merge_base ~= nil) and opts.use_merge_base or cfg.use_merge_base

    if use_mb then
        local mb = git_merge_base(target)
        return mb
    else
        return target
    end
end

local function prompt_target(default)
    default = default or cfg.default_base
    -- Simple prompt that accepts branch name or SHA. (We keep it minimal and fast.)
    local input = vim.fn.input({ prompt = "Branch/SHA (empty for " .. default .. "): " })
    if input == nil then return nil end
    input = vim.trim(input)
    return (input == "" and default or input)
end

-- --- Core actions -----------------------------------------------------------

-- 1) Review all changed files with difftool (opens tool panes per file)
function M.review_changed(opts)
    local target = resolve_target(opts)
    if not target then return end
    if has_fugitive() then
        vim.cmd("Git difftool -y " .. vim.fn.fnameescape(target))
    else
        -- Fallback to raw git; note this will use your external difftool config.
        vim.cmd("tabnew")
        vim.cmd("terminal git difftool -y " .. vim.fn.shellescape(target))
        notify("Running external 'git difftool' in terminal (fugitive not found).")
    end
end

-- 2) Build quickfix list of changed files (name-only)
function M.qf_changed(opts)
    local target = resolve_target(opts)
    if not target then return end
    local ok, out = run_git({ "diff", "--name-only", target, "--" })
    if not ok then
        notify("git diff --name-only failed", vim.log.levels.ERROR)
        return
    end
    local items = {}
    for _, f in ipairs(out) do
        if f ~= "" then
            table.insert(items, { filename = f })
        end
    end
    vim.fn.setqflist({}, " ", { title = "Changed vs " .. target, items = items })
    vim.cmd("copen")
end

-- 3) Vertical diff current file vs target
function M.vdiff_current(opts)
    local target = resolve_target(opts)
    if not target then return end
    if not has_fugitive() then
        notify("Gvdiffsplit requires vim-fugitive.", vim.log.levels.ERROR)
        return
    end
    vim.cmd("Gvdiffsplit! " .. vim.fn.fnameescape(target))
end

-- 4) Full inline diff
function M.inline_diff(opts)
    local target = resolve_target(opts)
    if not target then return end
    if not has_fugitive() then
        notify("Git diff requires vim-fugitive.", vim.log.levels.ERROR)
        return
    end
    vim.cmd("Git diff --patch --minimal " .. vim.fn.fnameescape(target))
end

-- --- Interactive wrappers ---------------------------------------------------

function M.review_changed_pick()
    local t = prompt_target(cfg.default_base)
    if t == nil then return end
    M.review_changed({ target = t, use_merge_base = false }) -- direct compare by default
end

function M.qf_changed_pick()
    local t = prompt_target(cfg.default_base)
    if t == nil then return end
    M.qf_changed({ target = t, use_merge_base = false }) -- direct compare by default
end

function M.vdiff_current_pick()
    local t = prompt_target(cfg.default_base)
    if t == nil then return end
    M.vdiff_current({ target = t, use_merge_base = false }) -- direct compare by default
end

function M.inline_diff_pick()
    local t = prompt_target(cfg.default_base)
    if t == nil then return end
    M.inline_diff({ target = t, use_merge_base = false }) -- direct compare by default
end

-- --- Convenience toggles & commands ----------------------------------------

function M.toggle_merge_base()
    cfg.use_merge_base = not cfg.use_merge_base
    notify("use_merge_base = " .. tostring(cfg.use_merge_base))
end

-- --- Setup (keymaps + user commands) ---------------------------------------

function M.setup(user_cfg)
    cfg = vim.tbl_deep_extend("force", cfg, user_cfg or {})

    local map = function(mode, lhs, rhs, desc)
        vim.keymap.set(mode, lhs, rhs, { silent = true, desc = desc })
    end

    -- Keep your originals (merge-base against origin/main by default)
    map("n", "<leader>gr", function() M.review_changed({}) end, "Git: review changed (merge-base default)")
    map("n", "<leader>gf", function() M.qf_changed({}) end,       "Git: quickfix changed (merge-base default)")
    map("n", "<leader>gd", function() M.vdiff_current({}) end,    "Git: diff current vs merge-base default")
    map("n", "<leader>gi", function() M.inline_diff({}) end,    "Git: diff current vs merge-base default")

    -- Added interactive variants (direct compare to chosen branch/SHA)
    map("n", "<leader>gR", M.review_changed_pick,  "Git: review changed vs picked")
    map("n", "<leader>gF", M.qf_changed_pick,      "Git: quickfix changed vs picked")
    map("n", "<leader>gD", M.vdiff_current_pick,   "Git: diff current vs picked")
    map("n", "<leader>gI", M.inline_diff_pick,   "Git: diff current vs picked")

    -- Quick toggle between merge-base and direct compare for defaults
    map("n", "<leader>gT", M.toggle_merge_base,    "Git: toggle use_merge_base")

    -- Extra: open fugitive status quickly, if available
    map("n", "<leader>gs", function()
        if has_fugitive() then vim.cmd("Git") else notify("vim-fugitive not found.", vim.log.levels.WARN) end
    end, "Git: status")

    -- User commands for ex-mode usage
    vim.api.nvim_create_user_command("GitDiffReview", function(opts)
        local target = opts.args ~= "" and opts.args or nil
        M.review_changed({ target = target })
    end, { nargs = "?" })

    vim.api.nvim_create_user_command("GitDiffFiles", function(opts)
        local target = opts.args ~= "" and opts.args or nil
        M.qf_changed({ target = target })
    end, { nargs = "?" })

    vim.api.nvim_create_user_command("GitDiffSplit", function(opts)
        local target = opts.args ~= "" and opts.args or nil
        M.vdiff_current({ target = target })
    end, { nargs = "?" })

    vim.api.nvim_create_user_command("GitDiffInline", function(opts)
        local target = opts.args ~= "" and opts.args or nil
        M.inline_diff({ target = target })
    end, { nargs = "?" })
end

return M
