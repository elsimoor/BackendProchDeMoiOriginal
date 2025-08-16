import { ApolloServer } from "apollo-server-express";
import http from "http";
import express, { Application, Request, Response } from "express";
import PaymentModel from '../models/PaymentModel';
import ReservationModel from '../models/ReservationModel';
// import InvoiceModel from '../models/InvoiceModel';
import Stripe from 'stripe';
import mongoose from "mongoose";
import cors from "cors";
import DataLoader from "dataloader";
import { resolvers, typeDefs } from "../controllers";
import {
  notFound,
  BatchUsers,
  BatchBusiness,
  BatchRoom,
  BatchTable,
  BatchService,
  BatchUStaff,
  BatchRestaurant
} from "../middlewares";



const { PORT, MONGO_URI } = process.env;

const app = express();

const startServer = async (app: Application) => {
  //? Stripe webhook: handle raw body before body parsers
  {
    // const stripeSecret = process.env.STRIPE_SECRET_KEY;
    // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = "sk_test_51FVWVMFTpuSblutlRm24blXavnHRwnXClQAazqCmTmdvJFS04QaHO73p9iwpNGqo8TrH7xlDAByr4v51vxqADGRO00BRvE4gWR"
    const webhookSecret = "we_1Rw3CkFTpuSblutlarxCPoUG"
    if (stripeSecret && webhookSecret) {
      
      const stripe: Stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });
      // Stripe requires the raw body to construct the event
      app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
        const sig = req.headers['stripe-signature'] as string | undefined;
        let event: any;
        try {
          event = stripe.webhooks.constructEvent(req.body, sig || '', webhookSecret);
        } catch (err: any) {
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
                const payment = await PaymentModel.findById(paymentId);
                if (payment) {
                  payment.status = 'paid';
                  payment.stripePaymentIntentId = session.payment_intent as string;
                  payment.stripeCustomerId = session.customer as string;
                  // Capture the first payment method type used
                  if (Array.isArray(session.payment_method_types) && session.payment_method_types.length > 0) {
                    payment.paymentMethod = session.payment_method_types[0];
                  }
                  // Attempt to retrieve receipt URL via payment intent details
                  try {
                    if (session.payment_intent) {
                      const pi: any = await stripe.paymentIntents.retrieve(session.payment_intent as string);
                      if (pi && pi.charges && pi.charges.data && pi.charges.data.length > 0) {
                        const charge = pi.charges.data[0];
                        payment.receiptUrl = charge.receipt_url as string;
                      }
                    }
                  } catch (innerErr) {
                    console.error('Failed to fetch payment intent details:', innerErr);
                  }
                  await payment.save();
                  if (payment.reservationId) {
                    await ReservationModel.findByIdAndUpdate(payment.reservationId, { paymentStatus: 'paid' });
                  }
                }
              } catch (updateErr) {
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
  app.use(express.json());
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true, // enable set cookie from server
    })
  );


  app.get("/hello", (_: Request, res: Response) => {
    res.json({
      message: "hello ❤",
    });
  });


  const server = new ApolloServer({
    resolvers,
    typeDefs,
    playground: process.env.NODE_ENV == "development",
    introspection: process.env.NODE_ENV == "development",
    context: async ({ req }) => {
      return {
        Loaders: {
          user: new DataLoader((keys) => BatchUsers(keys)),
          business: new DataLoader((keys) => BatchBusiness(keys)),
          room: new DataLoader((keys) => BatchRoom(keys)),
          table: new DataLoader((keys) => BatchTable(keys)),
          service: new DataLoader((keys) => BatchService(keys)),
          staff: new DataLoader((keys) => BatchUStaff(keys)),
          restaurant: new DataLoader((keys) => BatchRestaurant(keys)),
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

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  //? 404 and error handling
  app.use(notFound);

  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      httpServer.listen(PORT || 5000);
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    })
    .catch((err: any) => {
      console.error(err);
    });
};

export { app, startServer };
