let socket;

function signal(eventCode) {
    socket.emit("signal", eventCode.toString(), response => {
        document.getElementById("container").innerHTML = response;
    });
}

window.addEventListener("load", () => {
    socket = io();
    signal(0);
});