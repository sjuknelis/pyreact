provide: page, initial-state end

include file("common.arr")

fun increment(state :: PageState) -> PageState:
  update-state(state, "count", lam(count): num-to-string(raising-string-to-number(count) + 1) end)
end

fun decrement(state :: PageState) -> PageState:
  update-state(state, "count", lam(count): num-to-string(raising-string-to-number(count) - 1) end)
end

fun page(state :: PageState) -> HtmlNode:
  html-el("div",
    [list: html-prop("style", "border: 1px solid black")],
    empty,
    [list: html-el("p",
        [list: html-prop("style", "color: red")],
        empty,
        [list: html-text("count: " + get-state(state, "count"))]),
      html-el("button",
        empty,
        [list: html-event("onclick", increment)],
        [list: html-text("increment")]),
      html-el("button",
        empty,
        [list: html-event("onclick", decrement)],
        [list: html-text("decrement")])])
end

fun initial-state() -> PageState:
  [list: page-state-prop("count", "0")]
end