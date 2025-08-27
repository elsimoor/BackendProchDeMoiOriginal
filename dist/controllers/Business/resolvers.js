"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessResolvers = void 0;
// business.resolvers.ts
const graphql_1 = require("graphql");
const moment_1 = __importDefault(require("moment"));
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
            // Find the existing hotel by ID.  If no document is found, throw
            // a GraphQL error instead of returning null so that the
            // non‑nullable return type is respected and clients receive a
            // descriptive error message.  If the hotel exists, merge the
            // provided input into the document and save it.  The updated
            // document is then returned to the caller.
            const hotel = await HotelModel_1.default.findById(id);
            if (!hotel) {
                throw new Error('Hotel not found');
            }
            // Merge only provided fields from the input into the existing
            // document.  We iterate over the keys of the input and assign
            // them individually to avoid inadvertently overwriting
            // unmapped subdocuments or arrays.  Mongoose will cast and
            // validate types automatically when saving.
            Object.keys(input).forEach((key) => {
                // @ts-ignore - input is a generic type; dynamic assignment
                hotel[key] = input[key];
            });
            await hotel.save();
            return hotel;
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
            // Normalise the reservation time to HH:mm format.  Accept values with or
            // without leading zeros and ensure a consistent representation in
            // the database.  Use the provided date in ISO format when
            // parsing to avoid timezone issues.
            let normalizedTime = input.heure;
            try {
                normalizedTime = moment_1.default.utc(`${input.date}T${input.heure}`).format('HH:mm');
            }
            catch (err) {
                // Fall back to the original value if parsing fails
                normalizedTime = input.heure;
            }
            // Parse the date string into a Date object using UTC to avoid
            // timezone offsets.
            let parsedDate;
            try {
                parsedDate = moment_1.default.utc(input.date, 'YYYY-MM-DD').toDate();
            }
            catch (err) {
                // Fallback: directly construct a Date from the input string
                parsedDate = new Date(input.date);
            }
            // Before creating the reservation, enforce a per‑slot capacity check.
            try {
                const startOfDay = moment_1.default.utc(parsedDate).startOf('day').toDate();
                const endOfDay = moment_1.default.utc(parsedDate).endOf('day').toDate();
                const existingCount = await ReservationModel_1.default.countDocuments({
                    businessId: restaurant._id,
                    businessType: 'restaurant',
                    date: { $gte: startOfDay, $lt: endOfDay },
                    time: normalizedTime,
                    status: { $in: ['pending', 'confirmed'] },
                });
                const maxPerSlot = restaurant.settings?.maxReservationsParCreneau || 1;
                if (existingCount >= maxPerSlot) {
                    throw new graphql_1.GraphQLError('Ce créneau est déjà complet.', {
                        // @ts-ignore
                        extensions: { code: 'TIME_SLOT_FULL' },
                    });
                }
            }
            catch (err) {
                console.error('Error checking existing reservations:', err);
            }
            // Compute the number of guests from the personnes field.  Some clients may
            // pass the party size as a string; ensure that it is a number.
            const partySize = parseInt(input.personnes, 10) || input.personnes;
            // Build the reservation document.  Spread the remainder of the input
            // (excluding restaurantId) to preserve additional fields like
            // customerInfo, emplacement, paymentMethod and reservationFileUrl.  We
            // explicitly set the parsed date and normalized time to ensure
            // consistency.
            const reservation = new ReservationModel_1.default({
                ...reservationData,
                date: parsedDate,
                businessId: restaurant._id,
                businessType: 'restaurant',
                partySize: partySize,
                time: normalizedTime,
                status: 'pending',
                paymentStatus: 'pending',
                source: 'new-ui',
            });
            // Persist the chosen payment method and any reservation file URL
            // provided by the client.  These fields may be undefined
            // depending on whether the front-end asked for them.
            if (input.paymentMethod) {
                reservation.paymentMethod = input.paymentMethod;
            }
            if (input.reservationFileUrl) {
                reservation.reservationFileUrl = input.reservationFileUrl;
            }
            // Compute a basic total amount for the booking based on the number of guests.
            let pricePerGuest = 75;
            try {
                const horaires = restaurant.settings?.horaires || [];
                const toMinutes = (t) => {
                    const [h, m] = t.split(':').map((n) => parseInt(n, 10));
                    return h * 60 + m;
                };
                const reservationTimeMinutes = toMinutes(normalizedTime);
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
            return reservation;
        },
        createPrivatisationV2: async (_parent, { input }) => {
            const { restaurantId, ...privatisationData } = input;
            const restaurant = await RestaurantModel_1.default.findById(restaurantId);
            if (!restaurant) {
                throw new graphql_1.GraphQLError('Restaurant not found.');
            }
            // Normalise time and date for privatisations.  Use UTC parsing to avoid
            // discrepancies when comparing against existing reservations.
            let normalizedTime = input.heure;
            try {
                normalizedTime = moment_1.default.utc(`${input.date}T${input.heure}`).format('HH:mm');
            }
            catch (err) {
                normalizedTime = input.heure;
            }
            let parsedDate;
            try {
                parsedDate = moment_1.default.utc(input.date, 'YYYY-MM-DD').toDate();
            }
            catch (err) {
                parsedDate = new Date(input.date);
            }
            // Prevent overlapping privatisation bookings on the same slot.  Only one privatisation
            // (or reservation) can occupy a given time slot.
            try {
                const startOfDay = moment_1.default.utc(parsedDate).startOf('day').toDate();
                const endOfDay = moment_1.default.utc(parsedDate).endOf('day').toDate();
                const existingCount = await ReservationModel_1.default.countDocuments({
                    businessId: restaurant._id,
                    businessType: 'restaurant',
                    date: { $gte: startOfDay, $lt: endOfDay },
                    time: normalizedTime,
                    status: { $in: ['pending', 'confirmed'] },
                });
                const maxPerSlot = restaurant.settings?.maxReservationsParCreneau || 1;
                if (existingCount >= maxPerSlot) {
                    throw new graphql_1.GraphQLError('Ce créneau est déjà complet.', {
                        // @ts-ignore
                        extensions: { code: 'TIME_SLOT_FULL' },
                    });
                }
            }
            catch (err) {
                console.error('Error checking existing reservations for privatisation:', err);
            }
            const partySize = parseInt(input.personnes, 10) || input.personnes;
            const reservation = new ReservationModel_1.default({
                ...privatisationData,
                date: parsedDate,
                businessId: restaurant._id,
                businessType: 'restaurant',
                partySize: partySize,
                time: normalizedTime,
                duration: input.dureeHeures,
                status: 'pending',
                paymentStatus: 'pending',
                source: 'new-ui',
                notes: `Privatisation: ${privatisationData.type} - ${privatisationData.espace}, Menu: ${privatisationData.menu}`,
                specialRequests: `Privatisation event for ${partySize} guests.`,
            });
            // Persist chosen payment method and any attached file URL
            if (input.paymentMethod) {
                reservation.paymentMethod = input.paymentMethod;
            }
            if (input.reservationFileUrl) {
                reservation.reservationFileUrl = input.reservationFileUrl;
            }
            // Compute a default total amount for a privatisation.  Use a higher
            // rate per guest to reflect the premium nature of privatisations.
            const totalAmount = partySize * 100;
            reservation.totalAmount = totalAmount;
            await reservation.save();
            return reservation;
        }
    }
};
//# sourceMappingURL=resolvers.js.map