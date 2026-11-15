import { View, div } from "gpui-kit";
import { h_flex, v_flex, Input, InputState } from "gpui-base";
import { closeOverlay, machines, props, run, spaces, theme } from "herdr";

const MACHINE_SHORTCUTS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const MACHINE_HOME_FOLDER = "";

function fuzzyMatch(query, target) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const text = target.toLowerCase();
  return terms.every((term) => {
    let position = 0;
    for (const character of term) {
      position = text.indexOf(character, position);
      if (position < 0) return false;
      position += 1;
    }
    return true;
  });
}

function machineName(machine) {
  return machine.name ?? "This machine";
}

function machineKey(machine) {
  return machine.name ?? "";
}

function compareMachines(left, right) {
  if (left.name === null) return right.name === null ? 0 : -1;
  if (right.name === null) return 1;
  return left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
}

export default class MinimalSpacePicker extends View {
  init(_props, cx) {
    this.query = "";
    this.searchMode = false;
    this.activeList = "spaces";
    this.spaceAt = 0;
    this.machineAt = 0;
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.input = InputState.new({ placeholder: "Search spaces by name, folder, or machine…" });
    this.input.on("change", (_event, cx) => {
      this.query = this.input.value();
      this.spaceAt = 0;
      cx.notify();
    });
    this.input.on("focus", (_event, cx) => {
      this.searchMode = true;
      cx.notify();
    });
    this.input.on("blur", (_event, cx) => {
      this.searchMode = false;
      cx.notify();
    });
    this.input.on("submit", () => this.activateSpace(this.filteredSpaces()[this.spaceAt]));

    const activeSpaceIndex = this.filteredSpaces().findIndex((space) => space.active);
    this.spaceAt = activeSpaceIndex >= 0 ? activeSpaceIndex : 0;
    const activeSpace = spaces().find((space) => space.active);
    const machineRows = this.machineRows();
    const activeMachineIndex = machineRows.findIndex((row) =>
      machineKey(row.machine) === (activeSpace?.machine ?? ""),
    );
    this.machineAt = activeMachineIndex >= 0 ? activeMachineIndex : 0;
  }

  close() {
    closeOverlay(props().overlay);
  }

  filteredSpaces() {
    return spaces()
      .slice()
      .sort((left, right) => left.index - right.index)
      .filter((space) => {
        if (!this.query) return true;
        const machine = machines().find((item) => item.name === space.machine);
        const searchable = [space.name, space.folder, machine ? machineName(machine) : space.machine]
          .filter(Boolean)
          .join(" ");
        return fuzzyMatch(this.query, searchable);
      });
  }

  machineRows() {
    const orderedMachines = machines().slice().sort(compareMachines);
    const readyMachines = orderedMachines.filter((machine) => machine.layout === "ready");
    const shortcutByMachine = new Map(
      readyMachines.slice(0, MACHINE_SHORTCUTS.length).map((machine, index) => [
        machineKey(machine),
        MACHINE_SHORTCUTS[index],
      ]),
    );

    return orderedMachines.map((machine) => ({
      machine,
      shortcut: shortcutByMachine.get(machineKey(machine)) ?? null,
    }));
  }

  activateSpace(space) {
    if (!space) return;
    this.close();
    run("space.select", { id: space.id });
  }

  createSpace(machine) {
    if (!machine || machine.layout !== "ready") return;
    this.close();
    run("space.new", {
      machine: machineKey(machine),
      folder: MACHINE_HOME_FOLDER,
    });
  }

  createOnMachine(machine) {
    this.createSpace(machine);
  }

  moveSelection(direction, cx) {
    if (this.activeList === "spaces") {
      const spaces = this.filteredSpaces();
      if (!spaces.length) return;
      this.spaceAt = (this.spaceAt + direction + spaces.length) % spaces.length;
    } else {
      const machineRows = this.machineRows();
      if (!machineRows.length) return;
      this.machineAt = (this.machineAt + direction + machineRows.length) % machineRows.length;
    }
    cx.notify();
  }

  toggleList(cx) {
    this.activeList = this.activeList === "spaces" ? "machines" : "spaces";
    this.handle.focus();
    cx.notify();
  }

  activateSelection() {
    if (this.activeList === "spaces") {
      this.activateSpace(this.filteredSpaces()[this.spaceAt]);
    } else {
      this.createSpace(this.machineRows()[this.machineAt]?.machine);
    }
  }

  render() {
    const t = theme();
    const allSpaces = this.filteredSpaces();
    const machineRows = this.machineRows();
    this.spaceAt = allSpaces.length ? Math.max(0, Math.min(this.spaceAt, allSpaces.length - 1)) : 0;
    this.machineAt = machineRows.length ? Math.max(0, Math.min(this.machineAt, machineRows.length - 1)) : 0;

    const spaceRow = (space, index) => {
      const active = this.activeList === "spaces" && index === this.spaceAt;
      const machine = machines().find((item) => item.name === space.machine);
      return h_flex()
        .id(`minimal-space-picker-space-${space.id}`)
        .h(42)
        .flex_none()
        .px(10)
        .gap(10)
        .items_center()
        .rounded(6)
        .cursor_pointer()
        .bg(active ? t.selected : t.popover)
        .hover((el) => el.bg(t.hover))
        .on_click(() => this.activateSpace(space))
        .child(div()
          .w(8)
          .flex_none()
          .size(8)
          .rounded_full()
          .bg(space.active ? t.accent : t.border))
        .child(v_flex()
          .flex_1()
          .min_w(0)
          .gap(2)
          .child(div().truncate().text_color(space.active ? t.foreground : t.muted).child(space.name || "Unnamed space"))
          .child(div().truncate().text_size(10).text_color(t.dim).child(`${machine ? machineName(machine) : space.machine ?? "This machine"} · ${space.folder || "Home"}`)))
        .when(space.active, (el) => el.child(div().text_size(10).font_semibold().text_color(t.accent).child("here")));
    };

    const machineRow = (row, index) => {
      const { machine, shortcut } = row;
      const active = this.activeList === "machines" && index === this.machineAt;
      const ready = machine.layout === "ready";
      const status = ready ? "Home" : machine.layout === "loading" ? "Connecting…" : "Unavailable";
      return h_flex()
        .id(`minimal-space-picker-machine-${machineKey(machine) || "local"}`)
        .h(42)
        .flex_none()
        .px(10)
        .gap(9)
        .items_center()
        .rounded(6)
        .cursor_pointer()
        .bg(active ? t.selected : t.popover)
        .when(!ready, (el) => el.opacity(0.5))
        .when(ready, (el) => el.hover((style) => style.bg(t.hover)))
        .on_click(() => this.createSpace(machine))
        .child(div()
          .w(25)
          .flex_none()
          .text_size(10)
          .font_semibold()
          .text_color(shortcut ? t.accent : t.dim)
          .child(shortcut ?? "·"))
        .child(div().flex_1().min_w(0).truncate().text_color(ready ? t.foreground : t.dim).child(machineName(machine)))
        .child(div().text_size(10).text_color(t.dim).child(status));
    };

    const sectionTitle = (label, active) => h_flex()
      .h(28)
      .flex_none()
      .items_center()
      .justify_between()
      .text_size(11)
      .font_semibold()
      .text_color(active ? t.accent : t.muted)
      .child(label)
      .child(div().text_size(10).font_normal().text_color(t.dim).child(active ? "active" : "Tab"));

    return v_flex()
      .id("minimal-space-picker")
      .size_full()
      .min_h(0)
      .p(18)
      .gap(10)
      .bg(t.popover)
      .text_size(12)
      .track_focus(this.handle)
      .on_key_down((event, cx) => {
        const key = event.key.toLowerCase();
        if (key === "escape") {
          cx.stop_propagation();
          if (this.searchMode) {
            this.searchMode = false;
            this.handle.focus();
            cx.notify();
          } else {
            this.close();
          }
          return;
        }
        if (key === "tab") {
          cx.stop_propagation();
          if (this.searchMode) this.handle.focus();
          else this.toggleList(cx);
          return;
        }
        if (this.searchMode) return;
        if (key === "/" || event.key_char === "/") {
          cx.stop_propagation();
          this.input.focus();
          return;
        }
        const shortcutIndex = MACHINE_SHORTCUTS.indexOf(event.key);
        if (shortcutIndex >= 0) {
          cx.stop_propagation();
          const machine = machines()
            .filter((item) => item.layout === "ready")
            .slice()
            .sort(compareMachines)[shortcutIndex];
          this.createOnMachine(machine);
          return;
        }
        if (key === "j" || key === "k" || key === "down" || key === "up") {
          cx.stop_propagation();
          this.moveSelection(key === "j" || key === "down" ? 1 : -1, cx);
          return;
        }
        if (key === "enter") {
          cx.stop_propagation();
          this.activateSelection();
        }
      })
      .child(h_flex()
        .flex_none()
        .items_center()
        .justify_between()
        .child(div().text_size(16).font_semibold().text_color(t.foreground).child("Spaces"))
        .child(div().text_size(10).text_color(t.dim).child("/ search · j/k move · Tab switch list · Enter select/create · Esc close")))
      .child(h_flex()
        .h(38)
        .flex_none()
        .px(10)
        .gap(8)
        .items_center()
        .rounded(6)
        .border(1)
        .border_color(this.searchMode ? t.accent : t.border)
        .bg(t.background)
        .child(Input.new(this.input).flex_1().h_full().text_size(13).text_color(t.foreground)))
      .child(div().h(1).flex_none().bg(t.border))
      .child(h_flex()
        .id("minimal-space-picker-body")
        .flex_1()
        .min_w(0)
        .min_h(0)
        .gap(12)
        .items_stretch()
        .child(v_flex()
          .id("minimal-space-picker-spaces")
          .flex_1()
          .min_w(0)
          .min_h(0)
          .gap(3)
          .child(sectionTitle(`Open spaces (${allSpaces.length})`, this.activeList === "spaces"))
          .overflow_y_scrollbar()
          .children(allSpaces.map(spaceRow))
          .when(allSpaces.length === 0, (el) => el.child(div().p(12).text_color(t.dim).child("No matching spaces"))))
        .child(v_flex()
          .id("minimal-space-picker-machines")
          .flex_1()
          .min_w(0)
          .min_h(0)
          .gap(3)
          .border_l(1)
          .border_color(t.border)
          .pl(10)
          .child(sectionTitle("Create a space", this.activeList === "machines"))
          .overflow_y_scrollbar()
          .children(machineRows.map(machineRow))
          .when(machineRows.length === 0, (el) => el.child(div().p(12).text_color(t.dim).child("No connected machines")))))
      .child(h_flex()
        .flex_none()
        .justify_between()
        .text_size(10)
        .text_color(t.dim)
        .child(`${spaces().length} open space${spaces().length === 1 ? "" : "s"}`)
        .child("Number keys create at machine home"));
  }
}
