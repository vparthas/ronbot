// imports
const fs = require("fs");
const login = require("facebook-chat-api");

// load configurations
const user_id = process.env.USER_ID || "100001229366612"
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

    // Logged in
    api.setOptions({listenEvents: true});
    var stopListening = api.listenMqtt((err, message) => {
        if(err) return console.error(err);

        if(message.type.localeCompare("message") != 0) {
            return
        }

        console.log(message.senderID)
        if(message.senderID.localeCompare(user_id) == 0) {
            console.log(message.messageID)

            api.setMessageReaction("\uD83D\uDC13", message.messageID, err => { //🐓
                if(err) return console.error(err);
            });
        }
    });
});