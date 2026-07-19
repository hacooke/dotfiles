local M = {}

local MAX_FILE_LINES = 300

M.branch_diff = function(merge_branch)
    merge_branch = merge_branch or "main"
    local merge_base = vim.system({
        "git", "merge-base", merge_branch, "HEAD"
    }, { text = true }):wait().stdout:gsub("%s+", "")
    local diff_handle = vim.system({
        "git", "diff", "--name-only", ("%s..HEAD"):format(merge_base)
    }, { text = true, shell = true }):wait()
    local files = {}
    for file in diff_handle.stdout:gmatch("[^\r\n]+") do
        if file:match("%.lua$") or file:match("%.py$") or file:match("%.js$") then
            table.insert(files, file)
        end
    end

    print(("Comparing merge base (%s) of HEAD and %s with HEAD"):format(merge_base, merge_branch))

    local result = {}
    -- Get the diff
    local diff = vim.system({
        "git", "diff", "--no-ext-diff", ("%s..HEAD"):format(merge_base)
    }, { text = true, shell = true }):wait().stdout
    table.insert(result, "DIFF:\n" .. diff)

    -- Add file contents
    for _, file in ipairs(files) do
        local f = io.open(file, "r")
        if f then
            local line_count = 0
            for _ in f:lines() do
                line_count = line_count + 1
                if line_count > MAX_FILE_LINES then break end
            end
            f:seek("set", 0) -- rewind to start
            if line_count <= MAX_FILE_LINES then
                local content = f:read("*a")
                table.insert(result, ("FILE: %s\n%s"):format(file, content))
            else
                table.insert(result, ("FILE: %s (skipped, > %s lines)"):format(file, MAX_FILE_LINES))
            end
            f:close()
        else
            table.insert(result, ("FILE: %s (missing file)"):format(file))
        end
    end

    return table.concat(result, "\n\n")
end

M.next_diff = function()
    return M.branch_diff("next")
end

M.main_diff = function()
    return M.branch_diff("main")
end

return M
