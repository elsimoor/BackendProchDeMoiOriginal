"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privatisationResolvers = void 0;
const graphql_1 = require("graphql");
const PrivatisationOptionModel_1 = __importDefault(require("../../models/PrivatisationOptionModel"));
const RestaurantModel_1 = __importDefault(require("../../models/RestaurantModel"));
exports.privatisationResolvers = {
    Query: {
        privatisationOptionsByRestaurant: async (_parent, { restaurantId }) => {
            return PrivatisationOptionModel_1.default.find({ restaurantId });
        },
        privatisationOption: async (_parent, { id }) => {
            return PrivatisationOptionModel_1.default.findById(id);
        },
    },
    Mutation: {
        createPrivatisationOption: async (_parent, { input }, _ctx) => {
            const { restaurantId, capaciteMaximale, dureeMaximaleHeures } = input;
            const restaurant = await RestaurantModel_1.default.findById(restaurantId).select('settings');
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.', {
                    //@ts-ignore
                    extensions: { code: 'BAD_USER_INPUT', field: 'restaurantId' },
                });
            }
            const { settings } = restaurant;
            const capaciteTheorique = settings?.capaciteTheorique || 0;
            const frequenceCreneauxMinutes = settings?.frequenceCreneauxMinutes || 30;
            if (capaciteMaximale > capaciteTheorique) {
                throw new graphql_1.GraphQLError(`La capacité maximale ne peut pas dépasser la capacité théorique du restaurant (${capaciteTheorique}).`, {
                    //@ts-ignore
                    extensions: { code: 'BAD_USER_INPUT', field: 'capaciteMaximale' },
                });
            }
            if ((dureeMaximaleHeures * 60) % frequenceCreneauxMinutes !== 0) {
                throw new graphql_1.GraphQLError(`La durée maximale doit être un multiple de la fréquence des créneaux (${frequenceCreneauxMinutes} minutes).`, {
                    //@ts-ignore
                    extensions: { code: 'BAD_USER_INPUT', field: 'dureeMaximaleHeures' },
                });
            }
            const newOption = new PrivatisationOptionModel_1.default(input);
            await newOption.save();
            return newOption;
        },
        updatePrivatisationOption: async (_parent, { id, input }, _ctx) => {
            const option = await PrivatisationOptionModel_1.default.findById(id);
            if (!option) {
                throw new graphql_1.GraphQLError('Privatisation option not found.', {
                    //@ts-ignore
                    extensions: { code: 'NOT_FOUND' },
                });
            }
            const restaurant = await RestaurantModel_1.default.findById(option.restaurantId).select('settings');
            if (!restaurant) {
                // This case should ideally not happen if data integrity is maintained
                throw new graphql_1.GraphQLError('Associated restaurant not found.', {
                    //@ts-ignore
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
            const { settings } = restaurant;
            const capaciteTheorique = settings?.capaciteTheorique || 0;
            const frequenceCreneauxMinutes = settings?.frequenceCreneauxMinutes || 30;
            const capaciteMaximale = input.capaciteMaximale ?? option.capaciteMaximale;
            const dureeMaximaleHeures = input.dureeMaximaleHeures ?? option.dureeMaximaleHeures;
            if (capaciteMaximale > capaciteTheorique) {
                throw new graphql_1.GraphQLError(`La capacité maximale ne peut pas dépasser la capacité théorique du restaurant (${capaciteTheorique}).`, {
                    //@ts-ignore
                    extensions: { code: 'BAD_USER_INPUT', field: 'capaciteMaximale' },
                });
            }
            if ((dureeMaximaleHeures * 60) % frequenceCreneauxMinutes !== 0) {
                throw new graphql_1.GraphQLError(`La durée maximale doit être un multiple de la fréquence des créneaux (${frequenceCreneauxMinutes} minutes).`, {
                    //@ts-ignore
                    extensions: { code: 'BAD_USER_INPUT', field: 'dureeMaximaleHeures' },
                });
            }
            return PrivatisationOptionModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deletePrivatisationOption: async (_parent, { id }, _ctx) => {
            await PrivatisationOptionModel_1.default.findByIdAndDelete(id);
            return true;
        },
    },
};
//# sourceMappingURL=resolvers.js.map