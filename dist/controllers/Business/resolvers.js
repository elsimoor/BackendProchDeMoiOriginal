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
// Import the user model so that we can activate or deactivate users
// when a business is approved or rejected.
const UserModel_1 = __importDefault(require("../../models/UserModel"));
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
         * Return all hotels awaiting approval.  A hotel is considered
         * pending when its isActive flag is false.  This list is used
         * by the admin approvals page.
         */
        pendingHotels: async () => {
            return HotelModel_1.default.find({ isActive: false });
        },
        /**
         * Return all restaurants awaiting approval (isActive = false).
         */
        pendingRestaurants: async () => {
            return RestaurantModel_1.default.find({ isActive: false });
        },
        /**
         * Return all salons awaiting approval (isActive = false).
         */
        pendingSalons: async () => {
            return SalonModel_1.default.find({ isActive: false });
        }
    },
    // Field resolvers for custom types
    Hotel: {
        /**
         * Resolve the featuredLandingCard field for a hotel.  Currently
         * no explicit landing card data is stored in the database, so
         * this resolver returns null for all hotels.  The front‑end
         * gracefully handles a null response by generating fallback
         * values.  To support user‑configured cards in the future, add
         * a `featuredLandingCard` or `landingCards` property to the
         * Hotel model and return the appropriate record here.
         */
        featuredLandingCard: () => {
            return null;
        },
    },
    Mutation: {
        createHotel: async (_parent, { input }) => {
            const hotel = new HotelModel_1.default(input);
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
            const restaurant = new RestaurantModel_1.default(input);
            await restaurant.save();
            return restaurant;
        },
        updateRestaurant: async (_parent, { id, input }, _ctx) => {
            // Perform input validation and calculations for settings-related fields.  We
            // fetch the current restaurant up front so that we can merge nested
            // settings objects rather than overwriting them entirely when updating.
            const restaurant = await RestaurantModel_1.default.findById(id);
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            if (input.settings) {
                const { horaires, frequenceCreneauxMinutes, maxReservationsParCreneau, capaciteTotale, tables, customTables } = input.settings;
                // Validate horaires: ouverture < fermeture
                if (Array.isArray(horaires)) {
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
                if (frequenceCreneauxMinutes !== undefined && frequenceCreneauxMinutes !== null) {
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
                if (maxReservationsParCreneau !== undefined && maxReservationsParCreneau !== null) {
                    if (capaciteTotale !== undefined && capaciteTotale !== null && maxReservationsParCreneau > capaciteTotale) {
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
            // Build the update payload.  To avoid wiping out nested objects such as
            // restaurant.settings when only a subset of fields are provided, we
            // perform a shallow merge: existing settings are spread first, then
            // overridden by any provided settings fields.  For other top-level
            // fields we rely on Mongoose's default behavior of replacing the
            // property when defined in input.
            const updateData = { ...input };
            if (input.settings) {
                const currentSettings = restaurant.settings ? restaurant.settings.toObject ? restaurant.settings.toObject() : restaurant.settings : {};
                updateData.settings = { ...currentSettings, ...input.settings };
            }
            // Do not merge businessHours here; if provided, it will replace the
            // existing array.  If not provided, the existing businessHours remains.
            return RestaurantModel_1.default.findByIdAndUpdate(id, updateData, { new: true });
        },
        deleteRestaurant: async (_parent, { id }, _ctx) => {
            await RestaurantModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        },
        createSalon: async (_parent, { input }, _ctx) => {
            const salon = new SalonModel_1.default(input);
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
         * Approve a pending hotel by setting its isActive flag to true and
         * activating all users associated with the hotel.  If the hotel
         * cannot be found an error is thrown.  Returns the updated hotel.
         */
        approveHotel: async (_parent, { id }) => {
            const hotel = await HotelModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
            if (!hotel) {
                throw new graphql_1.GraphQLError('Hotel not found.');
            }
            // Activate all users linked to this hotel
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'hotel' }, { isActive: true });
            return hotel;
        },
        /**
         * Reject a pending hotel by deleting it and deactivating all
         * associated users.  The removed hotel document is returned.  If
         * no hotel is found an error is thrown.
         */
        rejectHotel: async (_parent, { id }) => {
            const hotel = await HotelModel_1.default.findById(id);
            if (!hotel) {
                throw new graphql_1.GraphQLError('Hotel not found.');
            }
            await HotelModel_1.default.findByIdAndDelete(id);
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'hotel' }, { isActive: false, businessId: null, businessType: null });
            return hotel;
        },
        /**
         * Approve a pending restaurant by setting isActive to true and
         * activating the associated users.
         */
        approveRestaurant: async (_parent, { id }) => {
            const restaurant = await RestaurantModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'restaurant' }, { isActive: true });
            return restaurant;
        },
        /**
         * Reject a pending restaurant by deleting it and deactivating
         * associated users.
         */
        rejectRestaurant: async (_parent, { id }) => {
            const restaurant = await RestaurantModel_1.default.findById(id);
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            await RestaurantModel_1.default.findByIdAndDelete(id);
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'restaurant' }, { isActive: false, businessId: null, businessType: null });
            return restaurant;
        },
        /**
         * Approve a pending salon by setting isActive to true and activating
         * the associated users.
         */
        approveSalon: async (_parent, { id }) => {
            const salon = await SalonModel_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true });
            if (!salon) {
                throw new graphql_1.GraphQLError('Salon not found.');
            }
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'salon' }, { isActive: true });
            return salon;
        },
        /**
         * Reject a pending salon by deleting it and deactivating
         * associated users.
         */
        rejectSalon: async (_parent, { id }) => {
            const salon = await SalonModel_1.default.findById(id);
            if (!salon) {
                throw new graphql_1.GraphQLError('Salon not found.');
            }
            await SalonModel_1.default.findByIdAndDelete(id);
            await UserModel_1.default.updateMany({ businessId: id, businessType: 'salon' }, { isActive: false, businessId: null, businessType: null });
            return salon;
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
                // Mark reservations created from the user-facing UI with a
                // specific source so that dashboard metrics can distinguish
                // them from bookings entered via the admin, phone, etc.
                source: 'new-ui',
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
                // Tag privatisations from the user-facing UI to ensure they
                // contribute to dashboard statistics.  Without this property
                // the default source would be 'website' which the dashboard
                // does not count.
                source: 'new-ui',
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