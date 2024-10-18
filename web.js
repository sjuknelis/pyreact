({
    requires: [],
    nativeRequires: ["express", "http", "socket.io"],
    provides: {
        shorthands: {},
        values: {
            "serve": ["arrow", [["arrow", [], "tany"], "tany"], "tany"]
        },
        aliases: {},
        datatypes: {}
    },
    theModule: function(runtime, namespace, uri, express, http, {Server}) {
        function stripPage(page) {
            const eventFuncs = {};

            function stripNode(node) {
                if (node.dict["tag-name"]) {
                    return {
                        "tag-name": node.dict["tag-name"],
                        props: runtime.ffi.toArray(node.dict["props"]).map(stripProp),
                        children: runtime.ffi.toArray(node.dict["children"]).map(stripNode)
                    }
                } else if (node.dict["text"]) {
                    return {
                        text: node.dict["text"]
                    }
                }
            }

            function stripProp(prop) {
                if (prop.dict["prop-name"]) {
                    return {
                        "prop-name": prop.dict["prop-name"],
                        value: prop.dict["value"]
                    }
                } else if (prop.dict["binding-name"]) {
                    return {
                        "binding-name": prop.dict["binding-name"],
                        "state-key": prop.dict["state-key"]
                    }
                } else if (prop.dict["event-name"]) {
                    const funcId = Math.floor(Math.random() * 1e6).toString();
                    eventFuncs[funcId] = prop.dict["func"];

                    return {
                        "event-name": prop.dict["event-name"],
                        "func-id": funcId
                    }
                }
            }

            return {node: stripNode(page), eventFuncs}
        }

        function setState(state, key, value) {
            for (const stateItem of state) {
                if (stateItem.dict["key"] == key) {
                    stateItem.dict["value"] = value;
                    break;
                }
            }
        }

        return runtime.makeModuleReturn({
            serve: runtime.makeFunction((page, initialState) => {
                return runtime.pauseStack(restarter => {
                    const app = express();
                    const server = http.createServer(app);
                    const io = new Server(server);

                    app.use("/static", express.static(__dirname + "/static"));

                    io.on("connection", socket => {
                        let state = initialState, eventFuncs;

                        socket.on("fire", (funcId, bindingResults, callback) => {
                            const arrayState = runtime.ffi.toArray(state);
                            for (const bindingResult of bindingResults) {
                                setState(arrayState, bindingResult.key, bindingResult.value);
                            }
                            state = runtime.ffi.makeList(arrayState);

                            if (funcId != 0) state = eventFuncs[funcId].app(state);

                            const pageRepr = stripPage(page.app(state));
                            eventFuncs = pageRepr.eventFuncs;
                            callback(pageRepr.node);
                        });
                    });

                    server.listen(3000, () => {
                        console.log("listening on *:3000");
                    });
                });
            })
        }, {});
    }
})