var mqtt = require("mqtt");
var fs = require("fs");
var Aedes = require("aedes");

var config = {
    accounts: {
        "root": {
            localOnly: true,
            password: "root"
        }
    },
    listenIP: "0.0.0.0",
    listenPort: "1883"
}

console.log("Starting C3CBot Database Server...")
if (fs.existsSync("config.json")) {
    try {
        config = JSON.parse(fs.readFileSync("config.json", {
            encoding: "utf8"
        }));
    } catch (ex) {
        console.error("Error: Invalid config! Writing default config...");
        fs.writeFileSync("config.json", JSON.stringify(config));
    }
} else {
    console.log("Config file not found. Writing default config...");
    fs.writeFileSync("config.json", JSON.stringify(config));
}
 

 
server.listen(parseInt(config.listenPort), config.listenIP);
server.on("listening", () => {
    console.log(`Server is listening at ${server.address().address}:${server.address().port}`);
});