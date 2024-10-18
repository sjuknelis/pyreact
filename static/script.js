const socket = io();

let bindingReporters = [];

function fire(funcId) {
    socket.emit("fire", funcId, bindingReporters.map(f => f()), page => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }

        bindingReporters = [];
        document.body.appendChild(buildNode(page));
    });
}

function buildNode(node) {
    if (node["tag-name"]) {
        const el = document.createElement(node["tag-name"]);

        for (const prop of node["props"]) {
            if (prop["prop-name"]) {
                el[prop["prop-name"]] = prop["value"];
            } else if (prop["binding-name"]) {
                bindingReporters.push(() => {
                    return {
                        key: prop["state-key"],
                        value: el[prop["binding-name"]]
                    }
                });
            } else if (prop["event-name"]) {
                el[prop["event-name"]] = () => fire(prop["func-id"]);
            }
        }

        for (const child of node["children"]) {
            el.appendChild(buildNode(child));
        }

        return el;
    } else if (node["text"]) {
        return document.createTextNode(node["text"]);
    }
}

window.addEventListener("load", () => {
    fire(0);
});