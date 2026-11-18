-- Hyprland 0.57+ Lua config, migrated from hyprland.conf.

hl.env("WLR_NO_HARDWARE_CURSORS", "1")
hl.env("TERMINAL", "ghostty")
hl.env("DOCKER_BUILDKIT", "1")
hl.env("COMPOSE_DOCKER_CLI_BUILD", "1")
hl.env("XCURSOR_SIZE", "24")
hl.env("HYPRCURSOR_SIZE", "24")
hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_TYPE", "wayland")

local terminal = "ghostty"
local fileManager = "nautilus"
local browser = "firefox"

local colorFile = assert(io.open(os.getenv("HOME") .. "/.config/hypr/colours.conf", "r"))
local colors = {}
for line in colorFile:lines() do
    local name, value = line:match("^%$([%w_]+)%s*=%s*rgb%(([%x]+)%)")
    if name then
        colors[name] = tonumber("0xff" .. value)
    end
end
colorFile:close()
assert(colors.hl_main and colors.bg_main, "colours.conf must define hl_main and bg_main")

hl.on("hyprland.start", function()
    hl.exec_cmd("swww-daemon")
    hl.exec_cmd("swww img -t none ~/documents/photos/wallpapers/current.png")
    hl.exec_cmd("kanshi > ~/.cache/kanshi.log")
    hl.exec_cmd("hypridle")
    hl.exec_cmd("swaync")
    hl.exec_cmd("swayosd-server")
    hl.exec_cmd("rclone mount gdrive: /mnt/gdrive")
    hl.exec_cmd("/usr/lib/polkit-kde-authentication-agent-1")
end)

hl.config({
    general = {
        gaps_in = 5,
        gaps_out = 20,
        border_size = 1,
        col = {
            active_border = colors.hl_main,
            inactive_border = colors.bg_main,
        },
        resize_on_border = true,
        allow_tearing = false,
        layout = "dwindle",
    },
    animations = {
        enabled = true,
    },
    decoration = {
        rounding = 8,
        rounding_power = 2,
        active_opacity = 1.0,
        inactive_opacity = 1.0,
        shadow = {
            enabled = true,
            range = 4,
            render_power = 3,
            color = "0xee1a1a1a",
        },
        blur = {
            enabled = true,
            size = 3,
            passes = 1,
            vibrancy = 0.1696,
        },
    },
    dwindle = {
        preserve_split = true,
        force_split = 2,
    },
    master = {
        new_status = "master",
    },
    misc = {
        force_default_wallpaper = -1,
        disable_hyprland_logo = false,
    },
    input = {
        kb_layout = "gb",
        kb_options = "altwin:swap_lalt_lwin",
        follow_mouse = 1,
        float_switch_override_focus = 0,
        sensitivity = 0,
        touchpad = {
            natural_scroll = true,
            disable_while_typing = false,
        },
    },
    cursor = {
        no_hardware_cursors = true,
        no_warps = false,
    },
})

hl.gesture({ fingers = 3, direction = "horizontal", action = "workspace" })

local curves = {
    { "easeOutQuint",   { 0.23, 1, 0.32, 1 } },
    { "easeInOutCubic", { 0.65, 0.05, 0.36, 1 } },
    { "linear",         { 0, 0, 1, 1 } },
    { "almostLinear",   { 0.5, 0.5, 0.75, 1 } },
    { "quick",          { 0.15, 0, 0.1, 1 } },
}
for _, curve in ipairs(curves) do
    hl.curve(curve[1], {
        type = "bezier",
        points = { { curve[2][1], curve[2][2] }, { curve[2][3], curve[2][4] } },
    })
end

local animations = {
    { "global",        10,   "default" },
    { "border",        5.39, "easeOutQuint" },
    { "windows",       4.79, "easeOutQuint" },
    { "windowsIn",     4.1,  "easeOutQuint", "popin 87%" },
    { "windowsOut",    1.49, "linear",       "popin 87%" },
    { "fadeIn",        1.73, "almostLinear" },
    { "fadeOut",       1.46, "almostLinear" },
    { "fade",          3.03, "quick" },
    { "layers",        3.81, "easeOutQuint" },
    { "layersIn",      4,    "easeOutQuint", "fade" },
    { "layersOut",     1.5,  "linear",       "fade" },
    { "fadeLayersIn",  1.79, "almostLinear" },
    { "fadeLayersOut", 1.39, "almostLinear" },
    { "workspaces",    1.94, "almostLinear", "fade" },
    { "workspacesIn",  1.21, "almostLinear", "fade" },
    { "workspacesOut", 1.94, "almostLinear", "fade" },
    { "zoomFactor",    7,    "quick" },
}
for _, animation in ipairs(animations) do
    hl.animation({
        leaf = animation[1],
        enabled = true,
        speed = animation[2],
        bezier = animation[3],
        style = animation[4],
    })
end

-- System and window controls.
hl.bind("SUPER + SHIFT + E", hl.dsp.exit())
hl.bind("SUPER + SHIFT + Q", hl.dsp.window.close())
local directions = {
    { key = "H", direction = "left" },
    { key = "J", direction = "down" },
    { key = "K", direction = "up" },
    { key = "L", direction = "right" },
}
for _, movement in ipairs(directions) do
    hl.bind("SUPER + " .. movement.key, hl.dsp.focus({ direction = movement.direction }))
    hl.bind("SUPER + SHIFT + " .. movement.key, hl.dsp.window.move({ direction = movement.direction }))
end
local function cycleWindow(direction)
    local activeWindow = hl.get_active_window()
    local activeWorkspace = hl.get_active_workspace()
    if not activeWindow or not activeWorkspace then
        return
    end

    local windows = hl.get_windows({ workspace = activeWorkspace })
    if #windows < 2 then
        return
    end

    for index, window in ipairs(windows) do
        if window.address == activeWindow.address then
            local targetIndex = ((index - 1 + direction) % #windows) + 1
            hl.dispatch(hl.dsp.focus({ window = windows[targetIndex] }))
            return
        end
    end
end

hl.bind("SUPER + TAB", function()
    cycleWindow(1)
end)
hl.bind("SUPER + SHIFT + TAB", function()
    cycleWindow(-1)
end)
hl.bind("SUPER + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind("SUPER + mouse:273", hl.dsp.window.resize(), { mouse = true })
hl.bind("SUPER + CTRL + F", hl.dsp.window.fullscreen({ action = "toggle", mode = "maximized" }))
hl.bind("SUPER + F", hl.dsp.window.fullscreen({ action = "toggle", mode = "fullscreen" }))
hl.bind("SUPER + O", hl.dsp.layout("togglesplit"))
hl.bind("SUPER + SHIFT + N", function()
    local activeWindow = hl.get_active_window()
    if not activeWindow then
        return
    end
    hl.dispatch(hl.dsp.window.float({ action = "toggle" }))
    if not activeWindow.floating then
        hl.dispatch(hl.dsp.window.resize({ x = 1800, y = 1000 }))
        hl.dispatch(hl.dsp.window.center())
    end
end)
hl.bind("SUPER + N", function()
    local activeWindow = hl.get_active_window()
    if not activeWindow then
        return
    end
    if activeWindow.floating then
        hl.dispatch(hl.dsp.window.cycle_next({ direction = "next", tiled = true }))
    else
        hl.dispatch(hl.dsp.window.cycle_next({ direction = "next", floating = true }))
    end
end)
hl.bind("SUPER + SHIFT + S", hl.dsp.window.pin())

-- Workspaces.
for i = 1, 12 do
    local key = i == 10 and "0" or (i == 11 and "minus" or (i == 12 and "equal" or tostring(i)))
    local workspaceId = i
    hl.bind("SUPER + " .. key, hl.dsp.focus({ workspace = workspaceId }))
    hl.bind("SUPER + SHIFT + " .. key, hl.dsp.window.move({ workspace = workspaceId, follow = false }))
end

local function moveWorkspaceToMonitor(direction)
    local activeWorkspace = hl.get_active_workspace()
    local currentMonitor = activeWorkspace and activeWorkspace.monitor
    if not currentMonitor then
        return
    end

    local targetMonitor
    local nearestDistance

    for _, monitor in ipairs(hl.get_monitors()) do
        local dx = monitor.x - currentMonitor.x
        local dy = monitor.y - currentMonitor.y
        local isInDirection =
            (direction == "left" and dx < 0) or
            (direction == "right" and dx > 0) or
            (direction == "up" and dy < 0) or
            (direction == "down" and dy > 0)
        if isInDirection then
            local distance = dx * dx + dy * dy
            if not nearestDistance or distance < nearestDistance then
                targetMonitor = monitor
                nearestDistance = distance
            end
        end
    end

    if targetMonitor then
        hl.dispatch(hl.dsp.workspace.move({ monitor = targetMonitor.name }))
    end
end

for _, movement in ipairs(directions) do
    local direction = movement.direction
    hl.bind("SUPER + CTRL + " .. movement.key, function()
        moveWorkspaceToMonitor(direction)
    end)
end

hl.bind("SUPER + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind("SUPER + mouse_up", hl.dsp.focus({ workspace = "e-1" }))

-- Applications and launchers.
hl.bind("SUPER + Return", hl.dsp.exec_cmd(terminal))
hl.bind("SUPER + numbersign", hl.dsp.exec_cmd(browser))
hl.bind("SUPER + E", hl.dsp.exec_cmd(fileManager))
hl.bind("SUPER + D", hl.dsp.exec_cmd("rofi -show run"))
hl.bind("SUPER + space", hl.dsp.exec_cmd("rofi -show drun -show-icons"))
hl.bind("SUPER + C",
    hl.dsp.exec_cmd(
    "SEL=$(ls -1 ~/.linkconfigs/ | rofi -dmenu -p 'config-selector:') && ghostty -e vim ~/.linkconfigs/$SEL"))
hl.bind("SUPER + S", hl.dsp.exec_cmd("rofi -show ssh"))
hl.bind("SUPER + bracketleft", hl.dsp.exec_cmd("$HOME/scripts/bin/tmux-sessionizer --rofi --rofi-prompt ' '"))
hl.bind("SUPER + P", hl.dsp.exec_cmd("$HOME/scripts/bin/herdr-sessionizer --rofi --rofi-prompt ' '"))
hl.bind("SUPER + W", hl.dsp.exec_cmd("$HOME/scripts/bin/wtog --rofi --rofi-prompt '󰖩 '"))
hl.bind("SUPER + A", hl.dsp.exec_cmd("$HOME/scripts/bin/pi-status --rofi"))

-- Speech to text
hl.bind("SUPER + V", hl.dsp.exec_cmd("/usr/lib/hyprwhspr/config/hyprland/hyprwhspr-tray.sh record"), { description = "Speech-to-text" })

-- Screenshot and audio/brightness controls.
hl.bind("Print", hl.dsp.exec_cmd("sshot_util"))
hl.bind("SUPER + F9", hl.dsp.exec_cmd("sshot_util"))
hl.bind("XF86SelectiveScreenshot", hl.dsp.exec_cmd("sshot_util -s"))
hl.bind("SUPER + F10", hl.dsp.exec_cmd("sshot_util -s"))
local function mediaBind(key, command, options)
    hl.bind(key, hl.dsp.exec_cmd(command), options)
end
local lockedRepeat = { locked = true, repeating = true }
local locked = { locked = true }
mediaBind("XF86AudioRaiseVolume", "swayosd-client --output-volume +5", lockedRepeat)
mediaBind("XF86AudioLowerVolume", "swayosd-client --output-volume -5", lockedRepeat)
mediaBind("XF86AudioMute", "swayosd-client --output-volume mute-toggle", lockedRepeat)
mediaBind("XF86AudioMicMute", "swayosd-client --input-volume mute-toggle", lockedRepeat)
mediaBind("SUPER + F3", "swayosd-client --output-volume +5", { repeating = true })
mediaBind("SUPER + F2", "swayosd-client --output-volume -5", { repeating = true })
mediaBind("SUPER + F1", "swayosd-client --output-volume mute-toggle")
mediaBind("SUPER + F4", "swayosd-client --input-volume mute-toggle")
mediaBind("XF86MonBrightnessUp", "swayosd-client --brightness +5", lockedRepeat)
mediaBind("XF86MonBrightnessDown", "swayosd-client --brightness -5", lockedRepeat)
mediaBind("SUPER + F5", "swayosd-client --brightness -5", { locked = true, repeating = true })
mediaBind("SUPER + F6", "swayosd-client --brightness +5", { locked = true, repeating = true })
mediaBind("XF86AudioNext", "swayosd-client --playerctl next", locked)
mediaBind("XF86AudioPause", "swayosd-client --playerctl play-pause", locked)
mediaBind("XF86AudioPlay", "swayosd-client --playerctl play-pause", locked)
mediaBind("XF86AudioPrev", "swayosd-client --playerctl previous", locked)
mediaBind("SUPER + Insert", "swayosd-client --playerctl next", locked)
mediaBind("SUPER + End", "swayosd-client --playerctl play-pause", locked)
mediaBind("SUPER + Home", "swayosd-client --playerctl previous", locked)

-- Widgets and resize submap.
hl.bind("SUPER + SHIFT + C", hl.dsp.exec_cmd("~/scripts/bin/calendar_widget"))
hl.bind("SUPER + I", hl.dsp.exec_cmd("swaync-client -t -sw"))
hl.define_submap("resize", function()
    hl.bind("H", hl.dsp.window.resize({ x = -20, y = 0, relative = true }), { repeating = true })
    hl.bind("J", hl.dsp.window.resize({ x = 0, y = 20, relative = true }), { repeating = true })
    hl.bind("K", hl.dsp.window.resize({ x = 0, y = -20, relative = true }), { repeating = true })
    hl.bind("L", hl.dsp.window.resize({ x = 20, y = 0, relative = true }), { repeating = true })
    hl.bind("ESCAPE", hl.dsp.submap("reset"))
    hl.bind("RETURN", hl.dsp.submap("reset"))
    hl.bind("SUPER + R", hl.dsp.submap("reset"))
end)
hl.bind("SUPER + R", hl.dsp.submap("resize"))

-- Floating scratchpads.
local function bindScratchpad(key, workspace, command)
    hl.bind(key, function()
        hl.dispatch(hl.dsp.workspace.toggle_special(workspace))
        hl.exec_cmd(command)
    end)
end
bindScratchpad("SUPER + SHIFT + F", "yazi_scratchpad", "~/scripts/bin/unique_term scratch_yazi -e yazi")
bindScratchpad("SUPER + SHIFT + P", "python_scratchpad", "~/scripts/bin/unique_term scratch_python -e python")
bindScratchpad("SUPER + SHIFT + T", "term_scratchpad", "~/scripts/bin/unique_term scratch_term")
bindScratchpad("SUPER + SHIFT + D", "lazydocker_scratchpad",
    "cd ~/code/edge-node-infrastructure && ~/scripts/bin/unique_term scratch_lazydocker -e lazydocker")

local scratchpads = {
    { "yazi_scratchpad",       "scratch_yazi" },
    { "python_scratchpad",     "scratch_python" },
    { "term_scratchpad",       "scratch_term" },
    { "lazydocker_scratchpad", "scratch_lazydocker" },
}
for _, scratchpad in ipairs(scratchpads) do
    hl.window_rule({
        name = scratchpad[1],
        match = { title = "^(" .. scratchpad[2] .. ")$" },
        float = true,
        size = { "monitor_w*0.8", "monitor_h*0.7" },
        center = true,
        workspace = "special:" .. scratchpad[1] .. " silent",
    })
end

hl.window_rule({
    name = "calendar_widget",
    match = { title = "calendar_term_widget" },
    float = true,
    pin = true,
    size = { "monitor_w*0.3", "monitor_h*0.26" },
    move = { "monitor_w*0.35", 40 },
})
hl.window_rule({
    name = "suppress_maximize",
    match = { class = ".*" },
    suppress_event = "maximize",
})
hl.window_rule({
    name = "fix_xwayland_drags",
    match = {
        class = "^$",
        title = "^$",
        xwayland = true,
        float = true,
        fullscreen = false,
        pin = false,
    },
    no_focus = true,
})

hl.bind("SUPER + SHIFT + X", hl.dsp.exec_cmd("hyprlock"))
