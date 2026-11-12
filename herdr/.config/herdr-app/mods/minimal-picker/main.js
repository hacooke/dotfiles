import { View, div, image, svg } from "gpui-kit";
import { h_flex, v_flex, Input, InputState } from "gpui-base";
import { agents, closeOverlay, focused, hc, panes, props, run, spaces, theme } from "herdr";

const PREVIEW_LINE_HEIGHT_PX = 14;
const PREVIEW_FIT_LINE_HEIGHT_PX = 18;
const PREVIEW_PADDING_Y_PX = 10;

const SORT_COLUMNS = ["name", "process", "space"];
const SORT_LABELS = { name: "Name", process: "Process", space: "Space" };

const STATUS_KEYS = {
  b: "blocked",
  w: "working",
  i: "idle",
  d: "done",
};

const STATUS_LABELS = {
  blocked: "Blocked",
  working: "Working",
  idle: "Idle",
  done: "Done",
};

function stripAnsi(text) {
  return text.replace(/\x1B(?:\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1B\\))/g, "");
}

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

function statusMark(status, t) {
  if (status === "working") return svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900);
  if (status === "blocked") return div().size(14).flex_none().rounded(4).bg(t.blocked + "2a").text_size(10).font_bold().text_color(t.blocked).flex().items_center().justify_center().child("!");
  if (status === "done") return div().size(7).flex_none().rounded_full().bg(t.done);
  if (status === "idle") return div().size(8).flex_none().rounded_full().border(1.5).border_color(t.idle ?? t.dim);
  return div().w(12).flex_none().text_color(t.dim).child("·");
}

export default class MinimalPicker extends View {
  init(_props, cx) {
    this.query = "";
    this.status = null;
    this.at = 0;
    this.headerAt = null;
    this.sortKey = null;
    this.sortDirection = 1;
    this.searchMode = false;
    this.previewRequest = 0;
    this.previewHeight = 0;
    this.previewText = "Loading preview…";
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.input = InputState.new({ placeholder: "Search sessions, panes, agents…" });
    this.input.on("change", (_event, cx) => {
      this.query = this.input.value();
      this.at = 0;
      this.headerAt = null;
      this.refreshPreview(this.rows()[this.at], cx);
    });
    this.input.on("focus", (_event, cx) => {
      this.searchMode = true;
      cx.notify();
    });
    this.input.on("blur", (_event, cx) => {
      this.searchMode = false;
      cx.notify();
    });
    this.input.on("submit", () => this.activate(this.rows()[this.at]));

    const rows = this.rows();
    const currentPane = focused()?.pane;
    const currentIndex = rows.findIndex((row) => row.pane.pane === currentPane);
    this.at = currentIndex >= 0 ? currentIndex : 0;
    this.refreshPreview(rows[this.at], cx);
  }

  close() {
    closeOverlay(props().overlay);
  }

  rows() {
    const allSpaces = spaces();
    const allPanes = panes();
    const allAgents = agents();
    const spaceById = new Map(allSpaces.map((space) => [space.id, space]));
    const tabById = new Map(allSpaces.flatMap((space) => space.tabs.map((tab) => [tab.id, { space, tab }])));
    const agentByPane = new Map(allAgents.map((agent) => [agent.pane, agent]));

    const rows = allPanes
      .map((pane) => {
        const agent = agentByPane.get(pane.pane);
        const context = tabById.get(pane.tab);
        const space = context?.space ?? spaceById.get(agent?.space);
        const tab = context?.tab;
        const status = agent?.status ?? pane.status;
        const searchable = [space?.name, tab?.name, pane.program?.name, pane.title, agent?.title, agent?.app]
          .filter(Boolean)
          .join(" ");
        return { pane, agent, space, tab, status, searchable };
      })
      .filter((row) => !this.status || row.status === this.status)
      .filter((row) => !this.query || fuzzyMatch(this.query, row.searchable));

    if (this.sortKey) {
      rows.sort((left, right) => {
        const leftValue = this.sortValue(left, this.sortKey);
        const rightValue = this.sortValue(right, this.sortKey);
        return leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" }) * this.sortDirection;
      });
    }
    return rows;
  }

  sortValue(row, key) {
    if (key === "name") return row.tab?.name ?? "";
    if (key === "process") return row.pane.program?.name ?? row.pane.title ?? "Terminal";
    return row.space?.name ?? row.pane.cwd ?? "";
  }

  activate(row) {
    if (!row) return;
    this.close();
    run("pane.focus", { pane: row.pane.pane });
  }

  refreshPreview(row, cx) {
    const request = ++this.previewRequest;
    const terminal = row?.pane.terminal;
    if (!terminal) {
      this.previewText = row ? "Preview unavailable for this pane." : "No matching panes.";
      cx.notify();
      return;
    }

    this.previewText = "Loading preview…";
    cx.notify();
    cx.spawn(async (cx) => {
      try {
        const result = await hc(["read", terminal, "--lines", "0"]);
        if (request !== this.previewRequest) return;
        this.previewText = result.code === 0
          ? stripAnsi(result.stdout)
          : result.stderr || "Preview unavailable.";
      } catch {
        if (request !== this.previewRequest) return;
        this.previewText = "Preview unavailable.";
      }
      cx.notify();
    });
  }

  moveSelection(direction, cx) {
    const rows = this.rows();
    if (this.headerAt !== null) {
      if (direction > 0) {
        this.headerAt = null;
        this.refreshPreview(rows[this.at], cx);
      } else {
        cx.notify();
      }
      return;
    }
    if (direction < 0 && this.at === 0) {
      this.headerAt = this.sortKey ? SORT_COLUMNS.indexOf(this.sortKey) : 0;
      cx.notify();
      return;
    }
    if (!rows.length) return;
    this.at = (this.at + direction + rows.length) % rows.length;
    this.refreshPreview(rows[this.at], cx);
  }

  focusHeader(index, cx) {
    this.headerAt = index;
    this.handle.focus();
    cx.notify();
  }

  moveHeader(direction, cx) {
    this.headerAt = (this.headerAt + direction + SORT_COLUMNS.length) % SORT_COLUMNS.length;
    cx.notify();
  }

  sortByHeader(cx) {
    const key = SORT_COLUMNS[this.headerAt];
    const selectedPane = this.rows()[this.at]?.pane.pane;
    this.sortDirection = this.sortKey === key ? -this.sortDirection : 1;
    this.sortKey = key;
    const rows = this.rows();
    const selectedIndex = rows.findIndex((row) => row.pane.pane === selectedPane);
    this.at = selectedIndex >= 0 ? selectedIndex : 0;
    this.refreshPreview(rows[this.at], cx);
  }

  toggleStatus(status, cx) {
    this.status = this.status === status ? null : status;
    this.at = 0;
    this.headerAt = null;
    this.refreshPreview(this.rows()[this.at], cx);
  }

  render() {
    const t = theme();
    const rows = this.rows();
    const currentPane = focused()?.pane;
    this.at = Math.max(0, Math.min(this.at, rows.length - 1));
    const selected = rows[this.at];
    const previewLines = (this.previewText || " ").split(/\r?\n/);
    const previewScale = this.previewHeight > 0
      ? Math.min(1, Math.max(
        0.01,
        (this.previewHeight - PREVIEW_PADDING_Y_PX) /
          (previewLines.length * PREVIEW_FIT_LINE_HEIGHT_PX),
      ))
      : 1;
    const previewLineHeight = PREVIEW_LINE_HEIGHT_PX * previewScale;
    const previewFontSize = 10 * previewScale;

    const columnTitle = (key, width) => {
      const index = SORT_COLUMNS.indexOf(key);
      const active = this.headerAt === index;
      const sorted = this.sortKey === key;
      const direction = this.sortDirection === 1 ? " ↑" : " ↓";
      return div()
        .id(`minimal-picker-column-${key}`)
        .when(width === null, (el) => el.flex_1())
        .when(width !== null, (el) => el.w(width).flex_none())
        .min_w(0)
        .h(26)
        .px(4)
        .flex()
        .items_center()
        .rounded(4)
        .text_size(11)
        .font_semibold()
        .text_color(active ? t.accent : t.muted)
        .bg(active ? t.selected : t.background)
        .cursor_pointer()
        .on_click((_event, cx) => this.focusHeader(index, cx))
        .child(`${SORT_LABELS[key]}${sorted ? direction : ""}`);
    };
    const columnHeader = h_flex()
      .id("minimal-picker-column-header")
      .h(28)
      .flex_none()
      .px(10)
      .gap(10)
      .items_center()
      .child(div().w(14).flex_none())
      .child(div().w(15).flex_none())
      .child(columnTitle("name", 130))
      .child(columnTitle("process", 150))
      .child(columnTitle("space", null));

    const statusFilter = (key, status) => h_flex()
      .id(`minimal-filter-${status}`)
      .h(25)
      .px(8)
      .gap(6)
      .items_center()
      .rounded(5)
      .border(1)
      .border_color(this.status === status ? t.accent : t.border)
      .bg(this.status === status ? t.selected : t.background)
      .text_color(this.status === status ? t.foreground : t.muted)
      .cursor_pointer()
      .hover((el) => el.bg(t.hover))
      .on_click((_event, cx) => this.toggleStatus(status, cx))
      .child(div().text_color(t.accent).font_semibold().child(key))
      .child(STATUS_LABELS[status]);

    const row = (item, index) => {
      const program = item.pane.program;
      const icon = program?.icon
        ? (program.tint ? svg(program.icon).size(15).flex_none().text_color(program.color ?? t.muted) : image(program.icon).w(15).h(15).flex_none())
        : div().w(15).flex_none().text_color(t.muted).child("□");
      const location = item.space?.name ?? "";
      return h_flex()
        .id(`minimal-picker-row-${item.pane.pane}`)
        .h(36)
        .flex_none()
        .px(10)
        .gap(10)
        .items_center()
        .rounded(6)
        .cursor_pointer()
        .bg(this.headerAt === null && index === this.at ? t.selected : t.popover)
        .hover((el) => el.bg(t.hover))
        .on_click(() => this.activate(item))
        .child(div().w(14).flex_none().flex().items_center().justify_center().child(statusMark(item.status, t)))
        .child(icon)
        .child(div().w(130).min_w(0).truncate().text_color(t.dim).child(item.tab?.name ?? ""))
        .child(div().w(150).min_w(0).truncate().text_color(t.foreground).child(program?.name ?? item.pane.title ?? "Terminal"))
        .child(div().flex_1().min_w(0).truncate().text_color(t.dim).child(location || item.pane.cwd || ""))
        .when(item.pane.pane === currentPane, (el) => el.child(div().text_size(10).text_color(t.accent).child("here")))
        .when(item.status === "blocked", (el) => el.child(div().text_size(10).font_semibold().text_color(t.blocked).child("needs you")));
    };

    return v_flex()
      .id("minimal-picker")
      .size_full()
      .min_h(0)
      .p(18)
      .gap(12)
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
        if (key === "tab" && this.searchMode) {
          cx.stop_propagation();
          this.handle.focus();
          return;
        }
        if (this.searchMode) return;
        if (this.headerAt !== null && (key === "h" || key === "l")) {
          cx.stop_propagation();
          this.moveHeader(key === "h" ? -1 : 1, cx);
          return;
        }
        if (key === "/" || event.key_char === "/") {
          cx.stop_propagation();
          this.searchMode = true;
          this.input.focus();
          cx.notify();
          return;
        }
        if (STATUS_KEYS[key]) {
          cx.stop_propagation();
          this.toggleStatus(STATUS_KEYS[key], cx);
          return;
        }
        if (key === "j" || key === "k") {
          cx.stop_propagation();
          this.moveSelection(key === "j" ? 1 : -1, cx);
          return;
        }
        if (key === "down" || key === "up") {
          cx.stop_propagation();
          this.moveSelection(key === "down" ? 1 : -1, cx);
          return;
        }
        if (key === "enter") {
          cx.stop_propagation();
          if (this.headerAt !== null) this.sortByHeader(cx);
          else this.activate(selected);
        }
      })
      .child(h_flex()
        .flex_none()
        .items_center()
        .justify_between()
        .child(div().text_size(16).font_semibold().text_color(t.foreground).child("Sessions"))
        .child(div().text_color(t.dim).child("/ search · j/k rows · ↑ header · h/l columns · Enter sort")))
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
        .child(svg("mods/workspace-chrome/search.svg").size(15).text_color(t.dim))
        .child(Input.new(this.input).flex_1().h_full().text_size(13).text_color(t.foreground)))
      .child(h_flex().flex_none().gap(6).items_center().children(
        Object.entries(STATUS_KEYS).map(([key, status]) => statusFilter(key, status)),
      ))
      .child(div().h(1).flex_none().bg(t.border))
      .child(h_flex()
        .id("minimal-picker-body")
        .flex_1()
        .min_w(0)
        .min_h(0)
        .gap(8)
        .items_stretch()
        .child(v_flex()
          .id("minimal-picker-results")
          .flex_1()
          .min_w(0)
          .min_h(0)
          .gap(3)
          .overflow_y_scrollbar()
          .child(columnHeader)
          .children(rows.map(row))
          .when(rows.length === 0, (el) => el.child(div().p(14).text_color(t.dim).child("No matching panes"))))
        .child(v_flex()
          .id("minimal-picker-preview")
          .flex_1()
          .min_w(0)
          .min_h(0)
          .border_l(1)
          .border_color(t.border)
          .pl(8)
          .gap(6)
          .child(h_flex()
            .flex_none()
            .items_center()
            .justify_between()
            .text_size(11)
            .child(div().font_semibold().text_color(t.foreground).child(selected?.pane.program?.name ?? selected?.pane.title ?? "Preview"))
            .child(div().min_w(0).truncate().text_color(t.dim).child(selected?.pane.cwd ?? "")))
          .child(v_flex()
            .flex_1()
            .min_h(0)
            .on_size_change((size, cx) => {
              if (Math.abs(size.height - this.previewHeight) > 0.5) {
                this.previewHeight = size.height;
                cx.notify();
              }
            })
            .overflow_x_scrollbar()
            .overflow_y_scrollbar()
            .px(8)
            .py(5)
            .bg(t.background)
            .children(previewLines.map((line, index) =>
              div()
                .id(`minimal-picker-preview-line-${index}`)
                .h(previewLineHeight)
                .flex_none()
                .whitespace_nowrap()
                .font_family("JetBrains Mono")
                .text_size(previewFontSize)
                .text_color(t.foreground)
                .child(line || " "),
            )))))
      .child(h_flex()
        .flex_none()
        .justify_between()
        .text_size(10.5)
        .text_color(t.dim)
        .child(`${rows.length} pane${rows.length === 1 ? "" : "s"}`)
        .child("Enter opens row / sorts header · Esc leaves search or closes"));
  }
}
