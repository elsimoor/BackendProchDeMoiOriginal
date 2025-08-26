"use strict";
// Export definitions and resolvers for the RoomType entity.  A room type
// represents a category of rooms within a hotel (e.g. Standard,
// Deluxe).  Hotels can create their own custom room types via
// mutations exposed in this module.
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomTypeTypeDef = exports.roomTypeResolvers = void 0;
var resolvers_1 = require("./resolvers");
Object.defineProperty(exports, "roomTypeResolvers", { enumerable: true, get: function () { return resolvers_1.roomTypeResolvers; } });
var typeDefs_1 = require("./typeDefs");
Object.defineProperty(exports, "roomTypeTypeDef", { enumerable: true, get: function () { return typeDefs_1.roomTypeTypeDef; } });
//# sourceMappingURL=index.js.map