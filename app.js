// imports
const fs = require("fs");
const login = require("facebook-chat-api");
const hash = require("object-hash");

// load configurations
const user_id = process.env.USER_ID || "100001229366612"
const cache_size = +process.env.CACHE_SIZE || 1000;
const dspchat = process.env.DSP_CHAT || "2206731299398237";
var credentials = {email: process.env.FB_USER, password: process.env.FB_PASS};

login(credentials, (err, api) => {
    // 2FA
    if(err) {
        switch (err.error) {
            case 'login-approval':
                console.log('Enter code > ');
                rl.on('line', (line) => {
                    err.continue(line);
                    rl.close();
                });
                break;
            default:
                console.error(err);
        }
        return;
    }

    // init cache
    var cache = new Object();
    var LRU = [];

    // Logged in
    api.setOptions({listenEvents: true});
    var stopListening = api.listenMqtt((err, message) => {
        // filter out boring events to quiet logs
        if(message.type.localeCompare("presence") == 0 || 
            message.type.localeCompare("typ") == 0) {
            return;
        }

        // log object data
        id = hash(message);
        console.log(id + ": " + JSON.stringify(message));
        if(err) return console.error(err);

        // branch based on event-type
        console.log("type: " + message.type);
        if(message.type.localeCompare("message") == 0 || 
            message.type.localeCompare("message_reply") == 0) {

            if(message.senderID.localeCompare(user_id) == 0) {
                api.setMessageReaction("\uD83D\uDC13", message.messageID, err => { //🐓
                    if(err) return console.error(err);
                });
                console.log("reacted: " + message.messageID);
            }

            // cache message
            console.log("caching: " + id);
            cache[message.messageID] = message;
            if(Object.keys(cache).length > cache_size) {
                delete cache[LRU.shift()];
                LRU.push(message.messageID);
            }

            console.log("cached: " + id);
        }
        else if(message.type.localeCompare("message_unsend") == 0) {
            if(message.threadID.localeCompare(dspchat) != 0) {
                return;
            }

            console.log("detected bitch move: " + id);
            if(message.messageID in cache) {
                console.log("message found: " + id);
                let body = {
                    body: "@Bitch deleted: " + cache[message.messageID].body,
                    mentions: [{
                        tag: '@Bitch',
                        id: message.senderID,
                        fromIndex: 0,
                   }],
                };
                api.sendMessage(body, dspchat);
            }
        }
    });
});