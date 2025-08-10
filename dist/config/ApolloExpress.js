"use strict";
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
        httpServer.listen(PORT || 5000);
        console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    })
        .catch((err) => {
        console.error(err);
    });
};
exports.startServer = startServer;
//# sourceMappingURL=ApolloExpress.js.map