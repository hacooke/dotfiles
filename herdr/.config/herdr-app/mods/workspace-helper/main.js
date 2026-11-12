import { View, div } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, closeOverlay, keys, machines, props, run, theme } from "herdr";

function keyLabel(binding) {
  const names = { ctrl: "Ctrl", shift: "Shift", alt: "Alt", cmd: "Cmd", super: "Super", pageup: "PageUp", pagedown: "PageDown", up: "Up", down: "Down" };
  return binding.split("-").map((part) => names[part.toLowerCase()] ?? part.toUpperCase()).join("+");
}

function shortcut(action) {
  const binding = keys().find((item) => item.section === "global" && item.action === action)?.keys;
  return binding ? keyLabel(binding) : "unbound";
}

function selectedSpaceShortcuts() {
  const bindings = keys()
    .filter((binding) => binding.section === "global" && binding.action.startsWith("space.select:"))
    .map((binding) => binding.keys);
  if (bindings.length === 0) return "unbound";
  const prefix = bindings[0].slice(0, bindings[0].lastIndexOf("-"));
  if (bindings.every((binding) => binding.slice(0, binding.lastIndexOf("-")) === prefix)) {
    const firstKey = bindings[0].split("-").pop();
    const lastKey = bindings[bindings.length - 1].split("-").pop();
    return `${keyLabel(`${prefix}-${firstKey}`)}–${lastKey}`;
  }
  return bindings.map(keyLabel).join(", ");
}

export default class WorkspaceHelper extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.handle.focus();
  }

  close() {
    closeOverlay(props().overlay);
  }

  createSpace(machine) {
    this.close();
    run("space.new", { machine });
  }

  focusAgent(agent) {
    this.close();
    run("agent.focus", { terminal: agent.address });
  }

  row(id, title, detail, hint, action, enabled = true) {
    const t = theme();
    return h_flex()
      .id(id)
      .h(34)
      .flex_none()
      .px(9)
      .gap(10)
      .items_center()
      .rounded(7)
      .text_color(enabled ? t.foreground : t.dim)
      .when(enabled, (el) => el.cursor_pointer().hover((s) => s.bg(t.selected)).on_click(action))
      .child(div().flex_1().child(title).when(Boolean(detail), (el) => el.child(div().text_size(10.5).text_color(t.dim).child(detail))))
      .child(div().text_size(10.5).text_color(t.dim).child(hint));
  }

  render() {
    const t = theme();
    const remoteMachines = machines()
      .filter((machine) => machine.name)
      .sort((left, right) => left.name.localeCompare(right.name));
    const machineChoices = [
      { name: "This computer", machine: "", state: "ready" },
      ...remoteMachines.map((machine) => ({
        name: machine.name,
        machine: machine.name,
        state: machine.layout,
      })),
    ];
    const waitingAgents = agents().filter((agent) => agent.status === "blocked");
    const shortcuts = [
      ["New space on focused machine", shortcut("space.new")],
      ["Previous / next space", `${shortcut("space.prev")} / ${shortcut("space.next")}`],
      ["Select space by number", selectedSpaceShortcuts()],
      ["Toggle sidebar", shortcut("layout.toggle:sidebar")],
      ["Previous / next agent", `${shortcut("agent.prev")} / ${shortcut("agent.next")}`],
    ];

    return v_flex()
      .id("workspace-helper")
      .track_focus(this.handle)
      .on_key_down((event) => {
        if (event.key === "escape") {
          this.close();
          return;
        }
        if (event.modifiers.control || event.modifiers.platform || event.modifiers.alt) return;
        const index = Number(event.key) - 1;
        const choice = Number.isInteger(index) && index >= 0 ? machineChoices[index] : null;
        if (choice && (choice.state === "ready" || choice.state === "connected")) this.createSpace(choice.machine);
      })
      .size_full()
      .min_h(0)
      .p(14)
      .gap(10)
      .bg(t.popover)
      .text_size(12)
      .child(
        h_flex()
          .h(24)
          .flex_none()
          .items_center()
          .justify_between()
          .child(div().text_size(15).font_semibold().text_color(t.foreground).child("Workspace"))
          .child(div().px(7).py(2).rounded(5).text_size(10.5).text_color(t.dim).child(`${shortcut("mod.open:workspace-helper")} · Esc`)),
      )
      .child(
        v_flex()
          .flex_1()
          .min_h(0)
          .overflow_y_scrollbar()
          .gap(12)
          .child(
            v_flex()
              .gap(3)
              .child(div().px(8).pb(3).text_size(10.5).font_medium().text_color(t.dim).child("NEW SPACE ON MACHINE"))
              .children(
                machineChoices.map((choice, index) => {
                  const available = choice.state === "ready" || choice.state === "connected";
                  const detail = choice.name === "This computer" ? "local" : choice.state;
                  return this.row(
                    `machine-${index}`,
                    choice.name,
                    detail,
                    String(index + 1),
                    () => this.createSpace(choice.machine),
                    available,
                  );
                }),
              ),
          )
          .child(div().h(1).mx(4).bg(t.border))
          .child(
            v_flex()
              .gap(3)
              .child(
                h_flex()
                  .px(8)
                  .pb(3)
                  .items_center()
                  .justify_between()
                  .child(div().text_size(10.5).font_medium().text_color(t.dim).child("WAITING FOR INPUT"))
                  .child(div().text_size(10.5).text_color(waitingAgents.length ? t.blocked : t.dim).child(String(waitingAgents.length))),
              )
              .when(
                waitingAgents.length === 0,
                (el) => el.child(div().px(8).py(5).text_color(t.dim).child("No agents waiting for input")),
              )
              .children(
                waitingAgents.map((agent) =>
                  this.row(
                    `agent-${agent.address}`,
                    agent.program?.name ?? agent.title ?? agent.app ?? "Agent",
                    [agent.space_name, agent.tab_name].filter(Boolean).join(" · "),
                    "Show",
                    () => this.focusAgent(agent),
                  ),
                ),
              ),
          )
          .child(div().h(1).mx(4).bg(t.border))
          .child(
            v_flex()
              .gap(2)
              .child(div().px(8).pb(3).text_size(10.5).font_medium().text_color(t.dim).child("KEYBOARD SHORTCUTS"))
              .children(
                shortcuts.map(([label, binding], index) =>
                  h_flex()
                    .id(`shortcut-${index}`)
                    .h(25)
                    .flex_none()
                    .px(8)
                    .items_center()
                    .justify_between()
                    .child(div().flex_1().min_w(0).truncate().text_color(t.foreground).child(label))
                    .child(div().flex_none().text_size(10.5).text_color(t.accent).child(binding)),
                ),
              ),
          ),
      );
  }
}
