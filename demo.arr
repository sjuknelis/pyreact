include js-file("web")
include file("web-bindings.arr")

fun increment(state :: PageState) -> PageState:
    update-state(state, "count", lam(count): num-to-string(raising-string-to-number(count) + 1) end)
end

fun decrement(state :: PageState) -> PageState:
    update-state(state, "count", lam(count): num-to-string(raising-string-to-number(count) - 1) end)
end

fun set-from-input(state :: PageState) -> PageState:
    set-state(state, "count", get-state(state, "input-count"))
end

fun page(state :: PageState) -> HtmlNode:
    count = raising-string-to-number(get-state(state, "count"))

    if not(count == 10):
        HTML(
            <div style="border: 1px solid black">
                <p style="color: red">{"count: " + num-to-string(count)}</p>
                <button data-onclick="increment">increment</button>
                <button data-onclick="decrement">decrement</button>
                <input type="number" data-bind-value="input-count" />
                <button data-onclick="set-from-input">set</button>
            </div>
        )
    else:
        HTML(
            <p>too high!!</p>
        )
    end
end

serve(page, [list: page-state-item("count", "0"), page-state-item("input-count", "0")])