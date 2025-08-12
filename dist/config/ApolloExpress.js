"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dataloader_1 = __importDefault(require("dataloader"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const { PORT, MONGO_URI } = process.env;
const app = (0, express_1.default)();
exports.app = app;
const startServer = async (app) => {
    //? Middlewares
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
        // Once the database connection is established, optionally seed
        // initial data.  This is especially useful during development
        // where we want to display sample landing cards on the public
        // landing page.  If there are already cards in the collection
        // we skip seeding.  Seeding is idempotent and runs only once
        // on server start.
        (async () => {
            try {
                const { default: LandingCardModel } = await Promise.resolve().then(() => __importStar(require('../models/LandingCardModel')));
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
            }
            catch (err) {
                console.error('Error seeding landing cards', err);
            }
        })();
        httpServer.listen(PORT || 5000);
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    })
        .catch((err) => {
        console.error(err);
    });
};
exports.startServer = startServer;
//# sourceMappingURL=ApolloExpress.js.map