"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FcmNotification = void 0;
var FCM = require('fcm-node');
const admin = require('firebase-admin');
var serverKey = {};
var fcm = new FCM(serverKey);
if (!admin.apps.length) {
    admin.initializeApp();
}
const FcmNotification = async (to, data) => {
    var message = {
        to,
        notification: {
            title: data.title,
            body: data.body
        }
    };
    try {
        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!", err);
            }
            else {
                console.log("Successfully sent with response: ", response.results[0]);
            }
        });
    }
    catch (error) {
        console.log("Error sending message:", error);
    }
};
exports.FcmNotification = FcmNotification;
//# sourceMappingURL=fcm.js.map