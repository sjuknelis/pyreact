include iolib

include file("common.arr")
include file("page.arr")

fun get-prop-text(prop :: HtmlProp) -> String:
  prop.name +
  "='" +
  prop.value +
  "'"
end

data CodedHtmlEvent:
  | coded-html-event(event :: HtmlEvent, code :: Number)
end

fun get-event-func(code :: Number, coded-events :: List<CodedHtmlEvent>) -> (PageState -> PageState):
  cases (List) coded-events:
    | empty => raise("event not found")
    | link(f, r) => if code == f.code:
        f.event.func
      else:
        get-event-func(code, r)
      end
  end
end

fun get-event-text(coded-event :: CodedHtmlEvent) -> String:
  coded-event.event.name +
  "='signal(" +
  num-to-string(coded-event.code) +
  ")'"
end

data HtmlNodeResult:
  | html-node-result(text :: String, coded-events :: List<CodedHtmlEvent>)
end

fun flatten(lst):
  lst.foldl(lam(elt, acc): acc.append(elt) end, empty)
end

fun get-node-result(node :: HtmlNode) -> HtmlNodeResult:
  cases (HtmlNode) node:
    | html-el(tag, props, events, children) =>
      coded-events = events.map(lam(event): coded-html-event(event, num-random(10000)) end)
      child-results = children.map(get-node-result)
      
      html-node-result("<" +
        tag +
        " " +
        props.map(get-prop-text).join-str(" ") +
        " " +
        coded-events.map(get-event-text).join-str(" ") +
        ">" +
        child-results.map(lam(result): result.text end).join-str("") +
        "</" +
        tag +
        ">",
        flatten([list: coded-events].append(child-results.map(lam(result): result.coded-events end))))

    | html-text(raw-text) => html-node-result(raw-text, empty)
  end
end

data ProcessResult:
  | process-result(text :: String, state :: PageState, coded-events :: List<CodedHtmlEvent>)
end

fun process(input :: String, state :: PageState, coded-events :: List<CodedHtmlEvent>) -> ProcessResult:
  event-code = cases (Option) string-to-number(input):
    | none => raise("invalid event input")
    | some(value) => value
  end
  
  new-state = if event-code == 0:
    state
  else:
    get-event-func(event-code, coded-events)(state)
  end
  
  root-result = get-node-result(page(new-state))
  process-result(root-result.text,
    new-state,
    root-result.coded-events)
end

fun main_loop(last-result :: ProcessResult) -> Boolean:
  input = prompt("")
  result = process(input, last-result.state, last-result.coded-events)
  (print(result.text + "\n") == "") or main_loop(result)
end

main_loop(process-result("", initial-state(), empty))