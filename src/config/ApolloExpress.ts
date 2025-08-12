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
      // Once the database connection is established, optionally seed
      // initial data.  This is especially useful during development
      // where we want to display sample landing cards on the public
      // landing page.  If there are already cards in the collection
      // we skip seeding.  Seeding is idempotent and runs only once
      // on server start.
      (async () => {
        try {
          const { default: LandingCardModel } = await import('../models/LandingCardModel');
          const count = await LandingCardModel.countDocuments();
          if (count === 0) {
            // Insert a handful of generic landing cards for each business type
            await LandingCardModel.insertMany([
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'hotel',
                title: 'Hôtel de Luxe',
                description: 'Profitez d\'un séjour inoubliable dans notre hôtel de luxe.',
                image: 'https://images.unsplash.com/photo-1551907234-18b7f1062430?auto=format&fit=crop&w=800&q=80',
                price: 180,
                rating: 4.8,
                location: 'Paris, France',
                tags: ['luxury', 'city', 'spa'],
                amenities: ['WiFi', 'Piscine', 'Spa'],
                specialOffer: true,
              },
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'hotel',
                title: 'Auberge du Lac',
                description: 'Détendez-vous dans un cadre naturel au bord du lac.',
                image: 'https://images.unsplash.com/photo-1501117716987-c8ad499b0a93?auto=format&fit=crop&w=800&q=80',
                price: 95,
                rating: 4.3,
                location: 'Annecy, France',
                tags: ['nature', 'relax'],
                amenities: ['Parking gratuit', 'Petit déjeuner inclus'],
                specialOffer: false,
              },
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'restaurant',
                title: 'Bistro Parisien',
                description: 'Savourez une cuisine française authentique dans une ambiance chic.',
                image: 'https://images.unsplash.com/photo-1541544181030-7c7cd2785bb4?auto=format&fit=crop&w=800&q=80',
                price: 40,
                rating: 4.6,
                location: 'Paris, France',
                tags: ['gourmet', 'wine'],
                amenities: ['Terrasse', 'Menu dégustation'],
                specialOffer: false,
              },
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'restaurant',
                title: 'Pizzeria Napoli',
                description: 'Pizza artisanale cuite au feu de bois.',
                image: 'https://images.unsplash.com/photo-1601924638867-3b29bd040bb9?auto=format&fit=crop&w=800&q=80',
                price: 15,
                rating: 4.2,
                location: 'Marseille, France',
                tags: ['pizza', 'familial'],
                amenities: ['À emporter', 'Livraison'],
                specialOffer: true,
              },
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'salon',
                title: 'Salon Elegance',
                description: 'Coupe, brushing et soins personnalisés dans un cadre élégant.',
                image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
                price: 50,
                rating: 4.7,
                location: 'Lyon, France',
                tags: ['hair', 'beauty'],
                amenities: ['Wifi gratuit', 'Thé & café'],
                specialOffer: true,
              },
              {
                businessId: new (require('mongoose').Types.ObjectId)(),
                businessType: 'salon',
                title: 'Barbershop Moderne',
                description: 'Un barbershop tendance pour une coupe et un rasage impeccables.',
                image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
                price: 35,
                rating: 4.5,
                location: 'Nice, France',
                tags: ['barber', 'modern'],
                amenities: ['Réservation en ligne', 'Musique live'],
                specialOffer: false,
              },
            ]);
            console.log('✅ Seeded initial landing cards');
          }
        } catch (err) {
          console.error('Error seeding landing cards', err);
        }
      })();

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
