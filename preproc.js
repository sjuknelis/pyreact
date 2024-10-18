const {readFile, writeFile} = require("fs/promises");
const {HTMLToJSON} = require('html-to-json-parser');

function getSegments(text) {
    let segments = [];
    let htmlSegmentStart;
    while ((htmlSegmentStart = text.indexOf("HTML(")) > -1) {
        segments.push({type: "plain", text: text.slice(0, htmlSegmentStart)});
        text = text.slice(htmlSegmentStart + 5);
        
        let parenCount = 1, i;
        for (i = 0; i < text.length && parenCount > 0; i++) {
            if (text.charAt(i) == "(") parenCount++;
            else if (text.charAt(i) == ")") parenCount--;
        }

        segments.push({type: "html", text: text.slice(0, i - 1)});
        text = text.slice(i);
    }
    return segments.concat([{type: "plain", text}]);
}

async function translateHtmlSegment(text) {
    const trimmed = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line != "")
        .join("");
    const json = await HTMLToJSON(trimmed);
    return translateNode(json);
}

function translateNode(node) {
    if (typeof node == "string") {
        if (node.charAt(0) == "{" && node.charAt(node.length - 1) == "}") return `html-text(${node.slice(1, -1)})`;
        else return `html-text("${node}")`;
    } else {
        return `html-el("${node.type}", [list: ${Object.entries(node.attributes || {}).map(translateProp).join(", ")}], [list: ${(node.content || []).map(translateNode).join(", ")}])`;
    }
}

function translateProp(prop) {
    const [key, value] = prop;
    if (key.startsWith("data-on")) {
        return `html-event("${key.split("-").slice(1).join("-")}", ${value})`;
    } else if (key.startsWith("data-bind-")) {
        return `html-binding("${key.split("-").slice(2).join("-")}", "${value}")`;
    } else if (key.startsWith("data-")) {
        return `html-prop("${key.split("-").slice(1).join("-")}", ${value})`;
    } else {
        return `html-prop("${key}", "${value}")`;
    }
}

(async () => {
    const srcName = process.argv[2];

    const segments = getSegments((await readFile(srcName)).toString());
    const translated = await Promise.all(segments.map(async segment => {
        if (segment.type == "html") return await translateHtmlSegment(segment.text);
        else return segment.text;
    }));
    await writeFile(`w-${srcName}`, translated.join(""));
})();