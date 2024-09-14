const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
const {startPyret, signalPyret} = require("./pyret-conn");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use("/", express.static(__dirname + "/static"));

io.on("connection", socket => {
    socket.on("signal", async (text, callback) => {
        callback(await signalPyret(text));
    });
});

const port = process.argv[2] || 8000;
server.listen(port, () => {
    startPyret();
    console.log(`Listening on *:${port}`);
});