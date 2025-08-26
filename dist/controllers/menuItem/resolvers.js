"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuResolvers = void 0;
// menu.resolvers.ts
// Authentication checks have been removed to simplify CRUD operations on
// menu items.  Clients may perform these mutations without requiring
// an authenticated user.
const MenuItemModel_1 = __importDefault(require("../../models/MenuItemModel"));
exports.menuResolvers = {
    Query: {
        menuItems: async (_parent, { restaurantId, category }) => {
            const filter = { restaurantId, isActive: true };
            if (category)
                filter.category = category;
            return MenuItemModel_1.default.find(filter).sort({ category: 1, name: 1 });
        },
        menuItem: async (_parent, { id }) => {
            return MenuItemModel_1.default.findById(id);
        }
    },
    Mutation: {
        createMenuItem: async (_parent, { input }, _ctx) => {
            const item = new MenuItemModel_1.default(input);
            await item.save();
            return item;
        },
        updateMenuItem: async (_parent, { id, input }, _ctx) => {
            return MenuItemModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteMenuItem: async (_parent, { id }, _ctx) => {
            await MenuItemModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        }
    }
};
//# sourceMappingURL=resolvers.js.map