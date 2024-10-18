provide: *, type * end

data PageStateItem:
    | page-state-item(key :: String, value :: String)
end

type PageState = List<PageStateItem>

data HtmlNode:
    | html-el(tag-name :: String, props :: List<HtmlProp>, children :: List<HtmlNode>)
    | html-text(text :: String)
end

data HtmlProp:
    | html-prop(prop-name :: String, value :: String)
    | html-binding(binding-name :: String, state-key :: String)
    | html-event(event-name :: String, func :: (PageState -> PageState))
end

fun get-state(state :: PageState, key :: String) -> String:
  cases (PageState) state:
    | empty => raise("key not found")
    | link(f, r) =>
    if f.key == key:
        f.value
    else:
        get-state(r, key)
    end
  end
end

fun update-state(state :: PageState, key :: String, func :: (String -> String)) -> PageState:
    cases (PageState) state:
        | empty => empty
        | link(f, r) =>
        if f.key == key:
            link(page-state-item(key, func(f.value)), r)
        else:
            link(f, update-state(r, key, func))
        end
    end
end

fun set-state(state :: PageState, key :: String, value :: String) -> PageState:
    update-state(state, key, lam(_): value end)
end

fun raising-string-to-number(str :: String) -> Number:
    cases (Option) string-to-number(str):
        | none => raise("string not a number")
        | some(value) => value
    end
end