const {spawn} = require("child_process");
 
let pyret, lastPyretResponse = null;

function startPyret() {
    pyret = spawn("node", [__dirname + "/../pyret/index.jarr"]);

    pyret.stdout.on("data", data => {
        lastPyretResponse = data;
    });

    pyret.stderr.on("data", data => {
        console.error(`Error: ${data}`);
    });

    pyret.on("close", code => {
        console.log(`Pyret closed with code ${code}`);
    });
}

function signalPyret(text) {
    pyret.stdin.write(text + "\n");

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (lastPyretResponse != null) {
                clearInterval(interval);
                const responseText = lastPyretResponse.toString().slice(0, -1);
                lastPyretResponse = null;
                resolve(responseText);
            }
        }, 1);
    });
}

module.exports = {startPyret, signalPyret}