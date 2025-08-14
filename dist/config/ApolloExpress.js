"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const PaymentModel_1 = __importDefault(require("../models/PaymentModel"));
const ReservationModel_1 = __importDefault(require("../models/ReservationModel"));
// import InvoiceModel from '../models/InvoiceModel';
const stripe_1 = __importDefault(require("stripe"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dataloader_1 = __importDefault(require("dataloader"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const { PORT, MONGO_URI } = process.env;
const app = (0, express_1.default)();
exports.app = app;
const startServer = async (app) => {
    //? Stripe webhook: handle raw body before body parsers
    {
        const stripeSecret = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (stripeSecret && webhookSecret) {
            const stripe = new stripe_1.default(stripeSecret, { apiVersion: '2022-11-15' });
            // Stripe requires the raw body to construct the event
            app.post('/stripe/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
                const sig = req.headers['stripe-signature'];
                let event;
                try {
                    event = stripe.webhooks.constructEvent(req.body, sig || '', webhookSecret);
                }
                catch (err) {
                    console.error('Webhook verification failed:', err);
                    return res.status(400).send(`Webhook Error: ${err.message}`);
                }
                // Handle the completed checkout session by marking the payment and reservation as paid
                switch (event.type) {
                    case 'checkout.session.completed': {
                        const session = event.data.object;
                        const paymentId = session.metadata?.paymentId;
                        if (paymentId) {
                            try {
                                const payment = await PaymentModel_1.default.findById(paymentId);
                                if (payment) {
                                    payment.status = 'paid';
                                    payment.stripePaymentIntentId = session.payment_intent;
                                    payment.stripeCustomerId = session.customer;
                                    // Capture the first payment method type used
                                    if (Array.isArray(session.payment_method_types) && session.payment_method_types.length > 0) {
                                        payment.paymentMethod = session.payment_method_types[0];
                                    }
                                    // Attempt to retrieve receipt URL via payment intent details
                                    try {
                                        if (session.payment_intent) {
                                            const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
                                            if (pi && pi.charges && pi.charges.data && pi.charges.data.length > 0) {
                                                const charge = pi.charges.data[0];
                                                payment.receiptUrl = charge.receipt_url;
                                            }
                                        }
                                    }
                                    catch (innerErr) {
                                        console.error('Failed to fetch payment intent details:', innerErr);
                                    }
                                    await payment.save();
                                    if (payment.reservationId) {
                                        await ReservationModel_1.default.findByIdAndUpdate(payment.reservationId, { paymentStatus: 'paid' });
                                    }
                                }
                            }
                            catch (updateErr) {
                                console.error('Error updating payment or reservation:', updateErr);
                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
                res.status(200).json({ received: true });
            });
        }
    }
    //? Middlewares
    // JSON body parser for all other routes
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true, // enable set cookie from server
    }));
    app.get("/hello", (_, res) => {
        res.json({
            message: "hello ❤",
        });
    });
    const server = new apollo_server_express_1.ApolloServer({
        resolvers: controllers_1.resolvers,
        typeDefs: controllers_1.typeDefs,
        playground: process.env.NODE_ENV == "development",
        introspection: process.env.NODE_ENV == "development",
        context: async ({ req }) => {
            return {
                Loaders: {
                    user: new dataloader_1.default((keys) => (0, middlewares_1.BatchUsers)(keys)),
                    business: new dataloader_1.default((keys) => (0, middlewares_1.BatchBusiness)(keys)),
                    room: new dataloader_1.default((keys) => (0, middlewares_1.BatchRoom)(keys)),
                    table: new dataloader_1.default((keys) => (0, middlewares_1.BatchTable)(keys)),
                    service: new dataloader_1.default((keys) => (0, middlewares_1.BatchService)(keys)),
                    staff: new dataloader_1.default((keys) => (0, middlewares_1.BatchUStaff)(keys)),
                    restaurant: new dataloader_1.default((keys) => (0, middlewares_1.BatchRestaurant)(keys)),
                },
                //@ts-ignore
                req,
                // pubsub,
            };
        },
    });
    server.applyMiddleware({
        app,
        path: "/procheDeMoi",
    });
    const httpServer = http_1.default.createServer(app);
    server.installSubscriptionHandlers(httpServer);
    //? 404 and error handling
    app.use(middlewares_1.notFound);
    mongoose_1.default
        .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
        httpServer.listen(PORT || 5000);
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    })
        .catch((err) => {
        console.error(err);
    });
};
exports.startServer = startServer;
//# sourceMappingURL=ApolloExpress.js.map