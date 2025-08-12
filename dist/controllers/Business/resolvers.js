"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessResolvers = void 0;
// business.resolvers.ts
const graphql_1 = require("graphql");
const HotelModel_1 = __importDefault(require("../../models/HotelModel"));
const RestaurantModel_1 = __importDefault(require("../../models/RestaurantModel"));
const SalonModel_1 = __importDefault(require("../../models/SalonModel"));
const ReservationModel_1 = __importDefault(require("../../models/ReservationModel"));
const LandingCardModel_1 = __importDefault(require("../../models/LandingCardModel"));
exports.businessResolvers = {
    Query: {
        hotels: async () => {
            return HotelModel_1.default.find({ isActive: true });
        },
        hotel: async (_parent, { id }) => {
            return HotelModel_1.default.findById(id);
        },
        restaurants: async () => {
            return RestaurantModel_1.default.find({ isActive: true });
        },
        restaurant: async (_parent, { id }) => {
            return RestaurantModel_1.default.findById(id);
        },
        salons: async () => {
            return SalonModel_1.default.find({ isActive: true });
        },
        salon: async (_parent, { id }) => {
            return SalonModel_1.default.findById(id);
        },
        /**
         * Return all hotels with isActive = false.  Used by admin
         * to view pending hotel registrations.
         */
        pendingHotels: async () => {
            return HotelModel_1.default.find({ isActive: false });
        },
        /**
         * Return all restaurants with isActive = false.  Used by admin
         * to view pending restaurant registrations.
         */
        pendingRestaurants: async () => {
            return RestaurantModel_1.default.find({ isActive: false });
        },
        /**
         * Return all salons with isActive = false.  Used by admin
         * to view pending salon registrations.
         */
        pendingSalons: async () => {
            return SalonModel_1.default.find({ isActive: false });
        }
    },
    /**
     * Field resolvers for nested properties on the Hotel type.  These resolvers
     * are executed after the parent Hotel object has been fetched by the
     * businessQueries above.  The featuredLandingCard resolver looks up
     * the single landing card marked as featured for the given hotel.
     */
    Hotel: {
        featuredLandingCard: async (parent) => {
            // The parent object contains the hotel id.  Use it to find the
            // landing card with isFeatured = true for this hotel.  We pass
            // the businessType explicitly to avoid mixing hotel cards with
            // restaurant or salon cards that may share the same id space.
            return LandingCardModel_1.default.findOne({ businessId: parent.id, businessType: 'hotel', isFeatured: true });
        }
    },
    Mutation: {
        createHotel: async (_parent, { input }) => {
            // When creating a hotel via the registration flow we mark
            // it as inactive by default.  This allows an administrator to
            // review and approve the business before it becomes visible on
            // the platform.
            const data = { ...input };
            if (data.isActive === undefined) {
                data.isActive = false;
            }
            const hotel = new HotelModel_1.default(data);
            await hotel.save();
            return hotel;
        },
        updateHotel: async (_parent, { id, input }, _ctx) => {
            return HotelModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteHotel: async (_parent, { id }, _ctx) => {
            await HotelModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        },
        createRestaurant: async (_parent, { input }, _ctx) => {
            const data = { ...input };
            if (data.isActive === undefined) {
                data.isActive = false;
            }
            const restaurant = new RestaurantModel_1.default(data);
            await restaurant.save();
            return restaurant;
        },
        updateRestaurant: async (_parent, { id, input }, _ctx) => {
            if (input.settings) {
                const { horaires, frequenceCreneauxMinutes, maxReservationsParCreneau, capaciteTotale, tables, customTables } = input.settings;
                // Validate horaires: ouverture < fermeture
                if (horaires) {
                    for (const horaire of horaires) {
                        if (horaire.ouverture && horaire.fermeture && horaire.ouverture >= horaire.fermeture) {
                            throw new graphql_1.GraphQLError("L'heure d'ouverture doit être antérieure à l'heure de fermeture.", {
                                //@ts-ignore
                                extensions: { code: 'BAD_USER_INPUT', field: 'horaires' },
                            });
                        }
                    }
                }
                // Validate frequenceCreneauxMinutes: positive and divisible by 5
                if (frequenceCreneauxMinutes) {
                    if (frequenceCreneauxMinutes <= 0 || frequenceCreneauxMinutes % 5 !== 0) {
                        throw new graphql_1.GraphQLError("La fréquence des créneaux doit être un nombre positif divisible par 5.", {
                            //@ts-ignore
                            extensions: { code: 'BAD_USER_INPUT', field: 'frequenceCreneauxMinutes' },
                        });
                    }
                }
                // Calculate capaciteTheorique. Take into account built-in table sizes
                // as well as any custom table sizes provided. Custom tables may allow sizes
                // other than 2,4,6,8.
                let capaciteTheorique = 0;
                if (tables) {
                    capaciteTheorique +=
                        (tables.size2 || 0) * 2 +
                            (tables.size4 || 0) * 4 +
                            (tables.size6 || 0) * 6 +
                            (tables.size8 || 0) * 8;
                }
                if (customTables) {
                    for (const ct of customTables) {
                        if (ct && typeof ct.taille === 'number' && typeof ct.nombre === 'number') {
                            capaciteTheorique += ct.taille * ct.nombre;
                        }
                    }
                }
                // Persist the calculated theoretical capacity on settings if any table information provided
                if (tables || customTables) {
                    input.settings.capaciteTheorique = capaciteTheorique;
                }
                // Validate maxReservationsParCreneau against capaciteTotale and capaciteTheorique
                if (maxReservationsParCreneau) {
                    if (capaciteTotale !== undefined && maxReservationsParCreneau > capaciteTotale) {
                        throw new graphql_1.GraphQLError("La limite par créneau ne peut pas dépasser la capacité totale.", {
                            //@ts-ignore
                            extensions: { code: 'BAD_USER_INPUT', field: 'maxReservationsParCreneau' },
                        });
                    }
                    // If theoretical capacity has been computed from tables and/or custom tables, validate
                    if ((tables || customTables) && maxReservationsParCreneau > capaciteTheorique) {
                        throw new graphql_1.GraphQLError("La limite par créneau ne peut pas dépasser la capacité théorique.", {
                            //@ts-ignore
                            extensions: { code: 'BAD_USER_INPUT', field: 'maxReservationsParCreneau' },
                        });
                    }
                }
            }
            return RestaurantModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteRestaurant: async (_parent, { id }, _ctx) => {
            await RestaurantModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        },
        createSalon: async (_parent, { input }, _ctx) => {
            const data = { ...input };
            if (data.isActive === undefined) {
                data.isActive = false;
            }
            const salon = new SalonModel_1.default(data);
            await salon.save();
            return salon;
        },
        updateSalon: async (_parent, { id, input }, _ctx) => {
            return SalonModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteSalon: async (_parent, { id }, _ctx) => {
            await SalonModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        },
        /**
         * Approve a hotel by setting isActive to true.
         */
        approveHotel: async (_parent, { id }, _ctx) => {
            return HotelModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
        },
        /**
         * Reject a hotel by ensuring isActive remains false.  If the hotel
         * does not exist the operation resolves to null.
         */
        rejectHotel: async (_parent, { id }, _ctx) => {
            return HotelModel_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        },
        /**
         * Approve a restaurant by setting isActive to true.
         */
        approveRestaurant: async (_parent, { id }, _ctx) => {
            return RestaurantModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
        },
        /**
         * Reject a restaurant by ensuring isActive remains false.
         */
        rejectRestaurant: async (_parent, { id }, _ctx) => {
            return RestaurantModel_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        },
        /**
         * Approve a salon by setting isActive to true.
         */
        approveSalon: async (_parent, { id }, _ctx) => {
            return SalonModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
        },
        /**
         * Reject a salon by ensuring isActive remains false.
         */
        rejectSalon: async (_parent, { id }, _ctx) => {
            return SalonModel_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true });
        },
        createReservationV2: async (_parent, { input }) => {
            const { restaurantId, ...reservationData } = input;
            const restaurant = await RestaurantModel_1.default.findById(restaurantId);
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            // Construct the reservation document.  Note that totalAmount is
            // computed on the server side rather than passed by the client.
            const partySize = input.personnes;
            const reservation = new ReservationModel_1.default({
                ...reservationData,
                businessId: restaurant._id,
                businessType: "restaurant",
                partySize: partySize,
                time: input.heure,
                status: "confirmed",
            });
            // Compute a basic total amount for the booking based on the number of guests.
            // If the restaurant has defined time-based pricing in its settings.horaires,
            // select the applicable price; otherwise default to 75 per guest.
            let pricePerGuest = 75;
            try {
                const horaires = restaurant.settings?.horaires || [];
                const toMinutes = (t) => {
                    const [h, m] = t.split(":").map((n) => parseInt(n, 10));
                    return h * 60 + m;
                };
                const reservationTimeMinutes = toMinutes(input.heure);
                for (const h of horaires) {
                    if (h.ouverture && h.fermeture) {
                        const start = toMinutes(h.ouverture);
                        const end = toMinutes(h.fermeture);
                        if (reservationTimeMinutes >= start && reservationTimeMinutes < end) {
                            if (typeof h.prix === 'number' && h.prix > 0) {
                                pricePerGuest = h.prix;
                            }
                            break;
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error computing price per guest', err);
            }
            const totalAmount = partySize * pricePerGuest;
            reservation.totalAmount = totalAmount;
            await reservation.save();
            // Automatically create an invoice for the reservation.  Each invoice
            // contains a single line item referencing the reservation ID and its
            // computed total amount.
            try {
                const items = [
                    {
                        description: `Reservation ${reservation._id.toString()}`,
                        price: totalAmount,
                        quantity: 1,
                        total: totalAmount,
                    },
                ];
                const invoice = new (require('../../models/InvoiceModel').default)({
                    reservationId: reservation._id,
                    businessId: reservation.businessId,
                    items,
                    total: totalAmount,
                });
                await invoice.save();
            }
            catch (err) {
                console.error('Failed to create invoice for restaurant reservation', err);
            }
            return reservation;
        },
        createPrivatisationV2: async (_parent, { input }) => {
            const { restaurantId, ...privatisationData } = input;
            const restaurant = await RestaurantModel_1.default.findById(restaurantId);
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            const partySize = input.personnes;
            const reservation = new ReservationModel_1.default({
                ...privatisationData,
                businessId: restaurant._id,
                businessType: "restaurant",
                partySize: partySize,
                time: input.heure,
                duration: input.dureeHeures,
                status: "confirmed",
                notes: `Privatisation: ${privatisationData.type} - ${privatisationData.espace}, Menu: ${privatisationData.menu}`,
                specialRequests: `Privatisation event for ${partySize} guests.`
            });
            // Compute a default total amount for a privatisation.  Use a higher
            // rate per guest to reflect the premium nature of privatisations.
            const totalAmount = partySize * 100; // 100 per guest for privatisations
            reservation.totalAmount = totalAmount;
            await reservation.save();
            // Create an invoice for the privatisation.
            try {
                const items = [
                    {
                        description: `Privatisation ${reservation._id.toString()}`,
                        price: totalAmount,
                        quantity: 1,
                        total: totalAmount,
                    },
                ];
                const invoice = new (require('../../models/InvoiceModel').default)({
                    reservationId: reservation._id,
                    businessId: reservation.businessId,
                    items,
                    total: totalAmount,
                });
                await invoice.save();
            }
            catch (err) {
                console.error('Failed to create invoice for privatisation', err);
            }
            return reservation;
        }
    }
};
//# sourceMappingURL=resolvers.js.map