var FCM = require('fcm-node');
const admin: any = require('firebase-admin');

var serverKey = {}




var fcm = new FCM(serverKey);

if (!admin.apps.length) {
    admin.initializeApp();
}


export const FcmNotification = async (to: any, data: any) => {


    var message = {
        to,
        notification: {
            title: data.title,
            body: data.body
        }
    };



    try {
        fcm.send(message, function (err: any, response: any) {
            if (err) {
                console.log("Something has gone wrong!", err);
            } else {
                console.log("Successfully sent with response: ", response.results[0]);
            }
        });
    } catch (error) {
        console.log("Error sending message:", error);

    }
}
