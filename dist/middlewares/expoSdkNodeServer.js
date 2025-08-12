"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = void 0;
const expo_server_sdk_1 = require("expo-server-sdk");
let expo = new expo_server_sdk_1.Expo();
const notifications = (to, msg) => {
    // // let somePushTokens = ['ExponentPushToken[KYgN5sLygSPNbSwZzkiuz9]', 'ExponentPushToken[BNOe4fJ_UbORGQCOtU_yrB]'];
    console.log('to an notif', to);
    let messages = [];
    messages.push({
        to: to.replace(/"/g, ""),
        sound: 'default',
        title: msg.title,
        body: msg.body,
        data: { withSome: 'data' },
    });
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }
            catch (error) {
                console.error(error);
            }
        }
    })();
    let receiptIds = [];
    for (let ticket of tickets) {
        if (ticket.id) {
            receiptIds.push(ticket.id);
        }
    }
    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    (async () => {
        for (let chunk of receiptIdChunks) {
            try {
                console.log('receiptIdChunks', receiptIdChunks);
                let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
                console.log(receipts);
                for (let receiptId in receipts) {
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    }
                    else if (status === 'error') {
                        console.error(`There was an error sending a notification: ${message}`);
                        if (details && details.error) {
                            console.error(`The error code is ${details.error}`);
                        }
                    }
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    })();
};
exports.notifications = notifications;
//# sourceMappingURL=expoSdkNodeServer.js.map