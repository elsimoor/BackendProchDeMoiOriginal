import { ApolloServer } from "apollo-server-express";
import http from "http";
import express, { Application, Request, Response } from "express";
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
  //? Middlewares
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
