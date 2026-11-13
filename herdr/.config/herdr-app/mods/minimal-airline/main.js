import { View, div, image, svg } from "gpui-kit";
import { h_flex, ScrollHandle } from "gpui-base";
import {
  agents,
  layout,
  openOverlay,
  panes,
  props,
  run,
  settings,
  spaces,
  theme,
  window as herdrWindow,
} from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

function leadPane(allPanes, tabId) {
  const inTab = allPanes.filter((pane) => pane.tab === tabId && pane.terminal);
  return (
    inTab.find((pane) => pane.focused) ??
    inTab.find((pane) => pane.program?.agent) ??
    inTab[0]
  );
}

function configuredColor(name, fallback, t) {
  if (typeof name !== "string") return fallback;
  return t[name] ?? name;
}

function guiSeparator(t, height = 14) {
  return div().w(1).h(height).mx(5).flex_none().bg(t.border);
}

function control(id, icon, action, t, title, size = 22) {
  return div()
    .id(id)
    .size(size)
    .flex_none()
    .flex()
    .items_center()
    .justify_center()
    .rounded(4)
    .text_color(t.muted)
    .cursor_pointer()
    .tooltip(title)
    .hover((el) => el.bg(t.hover).text_color(t.foreground))
    .on_mouse_down("left", (_event, cx) => cx.stop_propagation())
    .on_mouse_down("right", (_event, cx) => cx.stop_propagation())
    .on_click(action)
    .child(svg(icon).size(14));
}

export default class MinimalBar extends View {
  init() {
    this.pressedTab = null;
    this.agentScroll = ScrollHandle.new();
    this.agentOrder = "";
  }

  togglePanel(name) {
    const root = layout();
    const panel = find(root, "panel");
    const stack = find(root, "panel-body");
    if (!panel || !stack) return;
    if (!panel.hidden && stack.active === name) {
      run("layout.hide", { id: "panel" });
      return;
    }
    run("layout.select", { stack: "panel-body", child: name });
    run("layout.show", { id: "panel" });
  }

  tabRow(tab, index, activeSpace, allPanes, t, activeColor) {
    const pane = leadPane(allPanes, tab.id);
    const label = tab.named
      ? tab.name
      : (pane?.program?.name ?? pane?.title ?? "Terminal");
    return h_flex()
      .id(`minimal-tab-${tab.id}`)
      .h(26)
      .relative()
      .top(-1)
      .max_w(150)
      .min_w(0)
      .px(8)
      .gap(6)
      .items_center()
      .flex_none()
      .rounded_b(3)
      .text_size(12)
      .font_family(settings().font_family ?? "JetBrains Mono")
      .text_color(tab.active ? t.background : t.muted)
      .bg(tab.active ? activeColor : t.background)
      .hover((el) =>
        el
          .bg(tab.active ? activeColor : t.raised)
          .text_color(tab.active ? t.background : t.foreground),
      )
      .on_mouse_down("left", (event, cx) => {
        cx.stop_propagation();
        this.pressedTab = index;
        if (event.click_count === 2) run("tab.rename", { id: tab.id });
      })
      .on_mouse_up("left", () => {
        const from = this.pressedTab;
        this.pressedTab = null;
        if (from !== null && from !== index) {
          run("tab.move", {
            id: activeSpace.tabs[from].id,
            index: activeSpace.tabs.findIndex((item) => item.id === tab.id) + 1,
          });
        } else {
          run("tab.select", { id: tab.id });
        }
      })
      .on_mouse_down("right", (_event, cx) => {
        cx.stop_propagation();
        openOverlay({
          mod: "menu",
          kind: "popup",
          width: 200,
          props: { tab: "tab", target: { id: tab.id, space: activeSpace.id } },
        });
      })
      .when(Boolean(pane?.program?.icon), (el) =>
        el.child(
          pane.program.tint
            ? svg(pane.program.icon)
                .size(13)
                .flex_none()
                .text_color(tab.active ? t.background : t.muted)
            : image(pane.program.icon).w(13).h(13).flex_none(),
        ),
      )
      .child(div().min_w(0).truncate().child(label))
      .when(tab.status === "working", (el) =>
        el.child(
          svg("mods/workspace-chrome/spinner.svg")
            .size(10)
            .flex_none()
            .text_color(tab.active ? t.background : t.working)
            .spin(900),
        ),
      )
      .when(tab.status === "blocked" || tab.status === "done", (el) =>
        el.child(
          div()
            .size(6)
            .flex_none()
            .rounded_full()
            .bg(tab.active ? t.background : t[tab.status]),
        ),
      );
  }

  agentIcon(agent, t, viewProps) {
    const program = agent.program;
    const statusColor = t[agent.status] ?? t.dim;
    const agentTrayColor = configuredColor(
      viewProps.agent_tray_color,
      t.ansi5,
      t,
    );
    const iconColor = agent.status == "idle" ? agentTrayColor : statusColor;
    const picture = program?.icon
      ? program.tint
        ? svg(program.icon).size(14).text_color(t.background)
        : image(program.icon).w(14).h(14)
      : div()
          .size(14)
          .flex()
          .items_center()
          .justify_center()
          .text_size(10)
          .font_semibold()
          .text_color(t.background)
          .child((program?.name ?? "A").slice(0, 1));
    return div()
      .id(`minimal-agent-${agent.address}`)
      .relative()
      .w(20)
      .h(20)
      .ml(2)
      .top(1)
      .flex_none()
      .flex()
      .items_center()
      .justify_center()
      .rounded(3)
      .border(1)
      .border_color(iconColor)
      .bg(iconColor)
      .cursor_pointer()
      .tooltip(
        `${program?.name ?? "Agent"} · ${agent.status} · ${agent.space_name}`,
      )
      .hover((el) => el.border_color(t.foreground))
      .on_mouse_down("left", (_event, cx) => cx.stop_propagation())
      .on_click(() => run("agent.focus", { terminal: agent.address }))
      .child(picture);
    // .when(agent.status === "working", (el) => el.child(svg("mods/workspace-chrome/spinner.svg").size(8).absolute().right(0).bottom(0).text_color(t.background).spin(900)))
    // .when(agent.status === "done", (el) => el.child(div().size(5).absolute().right(1).bottom(1).rounded_full().bg(t.background)))
    // .when(agent.status === "idle", (el) => el.child(div().size(6).absolute().right(0).bottom(0).rounded_full().border(1).border_color(t.background).bg(statusColor)))
    // .when(agent.status === "blocked", (el) => el.child(div().absolute().top(-3).right(-4).min_w(11).h(11).px(2).rounded_full().border(1).border_color(t.blocked).bg(t.background).text_color(t.blocked).text_size(8).font_bold().flex().items_center().justify_center().child("!")));
  }

  windowButtons(t, w) {
    const button = (id, icon, command) =>
      div()
        .id(id)
        .size(20)
        .flex_none()
        .flex()
        .items_center()
        .justify_center()
        .rounded_full()
        .text_color(t.muted)
        .cursor_pointer()
        .hover((el) => el.bg(t.hover).text_color(t.foreground))
        .on_mouse_down("left", (_event, cx) => cx.stop_propagation())
        .on_click(() => run(command))
        .child(svg(`mods/tabs/${icon}.svg`).size(12));
    return h_flex()
      .flex_none()
      .gap(3)
      .child(button("minimal-minimize", "win-min", "window.minimize"))
      .child(
        button(
          "minimal-maximize",
          w.maximized ? "win-restore" : "win-max",
          "window.maximize",
        ),
      )
      .child(button("minimal-close", "win-close", "window.close"));
  }

  renderStatus(t, w) {
    return h_flex()
      .id("minimal-status")
      .size_full()
      .px(8)
      .gap(4)
      .items_center()
      .justify_start()
      .bg(t.chrome)
      .border_t(1)
      .border_color(t.border)
      .when(Boolean(w.buttons), (el) => el.child(this.windowButtons(t, w)))
      .child(
        control(
          "minimal-files",
          "mods/workspace-chrome/files.svg",
          () => this.togglePanel("files"),
          t,
          "Files",
          20,
        ),
      )
      .child(
        control(
          "minimal-changes",
          "mods/workspace-chrome/git-compare.svg",
          () => this.togglePanel("changes"),
          t,
          "Changes",
          20,
        ),
      )
      .child(
        control(
          "minimal-settings",
          "mods/workspace-chrome/settings.svg",
          () => run("app.settings"),
          t,
          "Settings",
          20,
        ),
      )
      .child(
        control(
          "minimal-machine-add",
          "mods/workspace-chrome/folder-plus.svg",
          () => run("mod.open", { name: "machine-add" }),
          t,
          "Add machine",
          20,
        ),
      );
  }

  render() {
    const t = theme();
    const viewProps = props() ?? {};
    const w = herdrWindow() ?? {};
    if (viewProps.footer) return this.renderStatus(t, w);

    const allSpaces = spaces();
    const space = allSpaces.find((item) => item.active);
    const allPanes = panes();
    const agentsByAddress = new Map(
      agents().map((agent) => [agent.address, agent]),
    );
    const spaceByTab = new Map(
      allSpaces.flatMap((item) => item.tabs.map((tab) => [tab.id, item])),
    );
    for (const pane of allPanes) {
      if (!pane.terminal || !pane.status || agentsByAddress.has(pane.terminal))
        continue;
      const owner = spaceByTab.get(pane.tab);
      agentsByAddress.set(pane.terminal, {
        address: pane.terminal,
        status: pane.status,
        program: pane.program,
        space: owner?.id,
        space_name: owner?.name ?? "Unknown space",
      });
    }
    const allAgents = [...agentsByAddress.values()];
    const agentsForTray = [...allAgents].sort(
      (a, b) => Number(a.space === space?.id) - Number(b.space === space?.id),
    );
    const agentOrder = agentsForTray
      .map((agent) => agent.address)
      .join("\u0000");
    const trayRightPadding = 8;
    const trayWidth = agentsForTray.length
      ? Math.min(280, agentsForTray.length * 23 + 2)
      : 0;
    const trayLayout = `${agentOrder}\u0000${trayWidth}:${trayRightPadding}`;
    if (trayLayout !== this.agentOrder) {
      this.agentOrder = trayLayout;
      if (agentsForTray.length)
        this.agentScroll.scroll_to_item(agentsForTray.length - 1);
    }
    const root = layout();
    const machineColor = configuredColor(viewProps.machine_color, t.ansi4, t);
    const spaceColor = configuredColor(viewProps.space_color, t.solid, t);
    const tabColor = configuredColor(viewProps.tab_color, t.accent, t);
    const baseColor = t.background;
    const agentTrayColor = configuredColor(
      viewProps.agent_tray_color,
      t.ansi5,
      t,
    );
    const lightsPadding =
      w.platform === "macos" && w.titlebar === "none" && !w.fullscreen
        ? Math.max(72, (root?.traffic_lights?.[0] ?? 12) + 64)
        : 8;
    const machineLabel = space?.machine
      ? h_flex()
          .h(26)
          .relative()
          .top(-1)
          .px(8)
          .gap(5)
          .flex_none()
          .items_center()
          .bg(machineColor)
          .text_color(t.background)
          .child(
            svg("mods/workspace-chrome/server.svg")
              .size(13)
              .text_color(t.background),
          )
          .child(div().max_w(100).truncate().child(space.machine))
      : h_flex()
          .h(26)
          .relative()
          .top(-1)
          .px(8)
          .gap(5)
          .flex_none()
          .items_center()
          .rounded_bl(4)
          .bg(machineColor)
          .text_color(t.background)
          .tooltip("This computer")
          .child(
            svg("mods/workspace-chrome/monitor.svg")
              .size(14)
              .text_color(t.background),
          );
    const tabElements =
      space?.tabs.flatMap((tab, index) => [
        ...(index > 0 ? [guiSeparator(t, 12)] : []),
        this.tabRow(tab, index, space, allPanes, t, tabColor),
      ]) ?? [];

    return h_flex()
      .id("minimal-bar")
      .size_full()
      .min_w(0)
      .gap(0)
      .items_center()
      .bg(baseColor)
      .font_family(settings().font_family ?? "JetBrains Mono")
      .text_size(12)
      .on_mouse_up("left", () => {
        this.pressedTab = null;
      })
      .when(
        w.platform === "macos" && w.titlebar === "none" && !w.fullscreen,
        (el) => el.pl(lightsPadding),
      )
      .when(Boolean(space), (el) =>
        el
          .child(machineLabel)
          .child(
            h_flex()
              .h(26)
              .relative()
              .top(-1)
              .left(-3)
              .px(8)
              .mr(10)
              .flex_none()
              .items_center()
              .rounded_b(4)
              .bg(spaceColor)
              .text_color(t.background)
              .child(div().max_w(150).truncate().child(space.name)),
          )
          .child(
            h_flex()
              .id("minimal-tabs")
              .flex_1()
              .min_w(20)
              .h_full()
              .gap(1)
              .items_center()
              .bg(baseColor)
              .overflow_x_scrollbar()
              .on_mouse_up("left", () => {
                this.pressedTab = null;
              })
              .children(tabElements),
          )
          .when(agentsForTray.length > 0, (el) =>
            el.child(
              div()
                .id("minimal-agent-tray")
                .w(trayWidth + trayRightPadding)
                .h(26)
                .relative()
                .top(-1)
                .flex_none()
                .rounded_bl(4)
                .bg(agentTrayColor)
                .child(
                  h_flex()
                    .id("minimal-agent-tray-scroll")
                    .w(trayWidth)
                    .h_full()
                    .min_w(0)
                    .flex_none()
                    .gap(1)
                    .items_center()
                    .pl(3)
                    .overflow_x_scrollbar()
                    .on_size_change((_size, cx) => {
                      this.agentScroll.scroll_to_item(agentsForTray.length - 1);
                      cx.notify();
                    })
                    .track_scroll(this.agentScroll)
                    .children(
                      agentsForTray.map((agent) =>
                        this.agentIcon(agent, t, viewProps),
                      ),
                    ),
                ),
            ),
          ),
      )
      .when(!space, (el) => el.child(div().flex_1()));
  }
}
