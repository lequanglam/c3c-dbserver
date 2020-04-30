var mqtt = require("mqtt");
var fs = require("fs");
var crypto = require("crypto");

var config = {
    accounts: {
        "root": {
            localOnly: true,
            password: "root"
        }
    },
    listenIP: "0.0.0.0",
    listenPort: "1883",
    key: "private.pem",
    cert: "public.pem"
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

var key, cert;
if (fs.existsSync(config.key) && fs.existsSync(config.cert)) {
    key = fs.readFileSync(config.key, {
        encoding: "utf8"
    });
    cert = fs.readFileSync(config.cert, {
        encoding: "utf8"
    });
} else {
    global.x = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });
    key = global.x.privateKey;
    cert = global.x.publicKey;
    delete global.x;
    fs.writeFileSync(config.key, key);
    fs.writeFileSync(config.cert, cert);
    console.log("Generated new keys.")
}

var aedes = require("aedes")();
var server = require('tls').createServer({
    key: key,
    cert: cert,
    ca: cert
});

server.listen(parseInt(config.listenPort), config.listenIP);
server.on("listening", () => {
    console.log(`Server is listening at ${server.address().address}:${server.address().port}`);
});
server.on("secureConnection", aedes.handle);

aedes.authenticate = function (client, username, password, callback) {
    if (config.accounts[username]) {
        if (config.accounts[username].password == password) {
            if (config.accounts[username].localOnly) {
                if (client.conn.remoteAddress == "127.0.0.1" || client.conn.remoteAddress == "::1" || client.conn.remoteAddress == client.conn.localAddress) {
                    callback(null, true);    
                } else {
                    callback(new Error("This account can only be used on the same device running this server application."), null);
                }
            } else {
                callback(null, true);
            }
        } else {
            callback(new Error("Bad username or password."), null);
        }
    } else {
        callback(new Error("Bad username or password."), null);
    }
}