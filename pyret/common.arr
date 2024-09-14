provide: *, type * end

data PageStateProp:
  | page-state-prop(field :: String, value :: String)
end

type PageState = List<PageStateProp>

data HtmlProp:
  | html-prop(name :: String, value :: String)
end

data HtmlEvent:
  | html-event(name :: String, func :: (PageState -> PageState))
end

data HtmlNode:
  | html-el(tag :: String, props :: List<HtmlProp>, events :: List<HtmlEvent>, children :: List<HtmlNode>)
  | html-text(raw-text :: String)
end

fun get-state(state :: PageState, field :: String) -> String:
  cases (PageState) state:
    | empty => raise("no field found")
    | link(f, r) => if f.field == field:
        f.value
      else:
        get-state(r, field)
      end
  end
end

fun update-state(state :: PageState, field :: String, func :: (String -> String)) -> PageState:
  cases (PageState) state:
    | empty => empty
    | link(f, r) => if f.field == field:
      link(page-state-prop(field, func(f.value)), r)
    else:
      link(f, update-state(r, field, func))
    end
  end
end

fun raising-string-to-number(str :: String) -> Number:
  cases (Option) string-to-number(str):
    | none => raise("string not a number")
    | some(value) => value
  end
end