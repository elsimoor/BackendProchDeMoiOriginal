import { Expo } from 'expo-server-sdk';

let expo = new Expo();


export const notifications = (to: any, msg: any) => {

    // // let somePushTokens = ['ExponentPushToken[KYgN5sLygSPNbSwZzkiuz9]', 'ExponentPushToken[BNOe4fJ_UbORGQCOtU_yrB]'];
    console.log('to an notif', to);

  
    let messages = [];
    

    messages.push({
        to: to.replace(/"/g, ""),
        sound: 'default',
        title: msg.title,
        body: msg.body,
        data: { withSome: 'data' },
    })


    let chunks = expo.chunkPushNotifications(messages);

    let tickets = [];
    (async () => {
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
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

                let receipts: any = await expo.getPushNotificationReceiptsAsync(chunk);
                console.log(receipts);

                for (let receiptId in receipts) {
                    let { status, message, details } = receipts[receiptId];
                    if (status === 'ok') {
                        continue;
                    } else if (status === 'error') {
                        console.error(
                            `There was an error sending a notification: ${message}`
                        );
                        if (details && details.error) {
                            console.error(`The error code is ${details.error}`);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    })();

}