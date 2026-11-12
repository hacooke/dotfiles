import { View, div, image, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, theme } from "herdr";

function programIcon(program, color) {
  if (!program?.icon) return null;
  return program.tint
    ? svg(program.icon).size(12).flex_none().text_color(color)
    : image(program.icon).w(12).h(12).flex_none();
}

export default class MinimalPaneTitle extends View {
  render() {
    const t = theme();
    const pane = panes().find((item) => item.pane === props()?.pane);
    if (!pane) return div();

    const title = ((pane.program?.agent || pane.program?.shell) && pane.program.name)
      || pane.title
      || pane.program?.name
      || "Terminal";
    const icon = programIcon(pane.program, pane.focused ? t.accent : t.muted);

    return h_flex()
      .id(`minimal-pane-title-${pane.pane}`)
      .relative()
      .top(-9)
      .left(10)
      .w_fit()
      .h(18)
      .px(5)
      .gap(5)
      .items_center()
      .rounded(3)
      .bg(t.background)
      .text_size(11)
      .text_color(pane.focused ? t.accent : t.muted)
      .on_click(() => run("pane.focus", { pane: pane.pane }))
      .when(Boolean(icon), (el) => el.child(icon))
      .child(title);
  }
}
