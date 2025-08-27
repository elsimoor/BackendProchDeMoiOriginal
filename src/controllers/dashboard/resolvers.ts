import ReservationModel from '../../models/ReservationModel';
import RestaurantModel from '../../models/RestaurantModel';
import { GraphQLError } from 'graphql';
import moment from 'moment';

export const dashboardResolvers = {
  Query: {
    dashboardMetrics: async (_, { restaurantId, from, to }) => {
      // Fetch the restaurant by its ID to ensure it exists.
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }

      // Define the date range over which to compute metrics.  When a
      // specific `from` and `to` are provided (for example, when a
      // single day is selected on the frontend), treat them as
      // inclusive day boundaries using UTC and start/end of day.  If
      // either is not provided, fall back to today rather than the
      // entire month.  This change ensures that the default dashboard
      // overview reflects bookings made today instead of aggregating
      // over the whole month by default.
      let startDate = moment.utc().startOf('day');
      let endDate = moment.utc().endOf('day');
      if (from && to) {
        startDate = moment.utc(from).startOf('day');
        endDate = moment.utc(to).endOf('day');
      }

      /*
       * Query reservations linked to this restaurant.  We match on
       * businessId equal to the restaurant's own `_id` (not the
       * tenant/client ID) and restrict to the restaurant business
       * type.  To ensure that the dashboard reflects only bookings
       * originating from the new `/u` pages, we further filter on
       * `source: 'new-ui'`.  Historically the `date` field stored the
       * reservation’s scheduled date (e.g. dining date) which could
       * be in the future.  The dashboard metrics are meant to
       * represent revenue generated on the day the reservation was
       * created, not the day the guest will arrive.  We therefore
       * filter by `createdAt` rather than `date` so that a booking
       * made today with a future dining date is included in today’s
       * overview.  Without this change reservations scheduled in the
       * future would not appear until their dining date, causing
       * mismatched revenue figures.
       */
      // @ts-ignore
      const reservations = await ReservationModel.find({
        businessId: restaurant._id,
        businessType: 'restaurant',
        source: 'new-ui',
        createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      });

      // Determine the restaurant settings once and reuse below.
      const settings: any = restaurant.settings || {};

      // Consider only confirmed reservations when computing revenue and occupancy.
      const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');

      // Total number of reservations (all statuses) over the period.
      const reservationsTotales = reservations.length;

      // Sum the totalAmount of confirmed reservations to compute revenue.  When totalAmount
      // is missing or zero (e.g. legacy bookings), compute a fallback based on
      // party size and the horaire pricing.  Privatisations (with a non-null
      // duration) use a higher default rate per guest.
      const chiffreAffaires = confirmedReservations.reduce((acc, r) => {
        let amount = r.totalAmount ?? 0;
        if (!amount || amount <= 0) {
          let pricePerGuest = 75;
          try {
            const horairesArr = Array.isArray(settings.horaires) ? settings.horaires : [];
            const toMinutes = (t: string) => {
              const [h, m] = t.split(':').map((n: string) => parseInt(n, 10));
              return h * 60 + m;
            };
            if (r.time) {
              const reservationTimeMinutes = toMinutes(r.time);
              for (const h of horairesArr) {
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
          } catch (err) {
            console.error('Error computing fallback price per guest', err);
          }
          // For privatisation bookings (identified by a non-null duration), apply a higher base rate.
          if (typeof r.duration === 'number' && r.duration > 0) {
            pricePerGuest = 100;
          }
          amount = (r.partySize || 1) * pricePerGuest;
        }
        return acc + amount;
      }, 0);

      // Compute occupancy rate based on restaurant capacity and slot frequency.
      const capaciteEffectiveParCreneau = Math.min(
        settings.capaciteTotale || Infinity,
        settings.capaciteTheorique || Infinity,
        settings.maxReservationsParCreneau || Infinity,
      );
      const frequence =
        typeof settings.frequenceCreneauxMinutes === 'number' && settings.frequenceCreneauxMinutes > 0
          ? settings.frequenceCreneauxMinutes
          : 30;
      const horaires = Array.isArray(settings.horaires) ? settings.horaires : [];
      const jours = endDate.diff(startDate, 'days') + 1;
      const slotsParJour = (horaires.length || 1) * (60 / frequence);
      const totalCreneaux = jours * slotsParJour;
      const capaciteTotaleSurPeriode = totalCreneaux * capaciteEffectiveParCreneau;
      const totalPersonnesConfirmees = confirmedReservations.reduce(
        (acc, r) => acc + (r.partySize || 0),
        0,
      );
      const tauxRemplissage =
        capaciteTotaleSurPeriode > 0 ? totalPersonnesConfirmees / capaciteTotaleSurPeriode : 0;

      return {
        reservationsTotales,
        chiffreAffaires,
        tauxRemplissage: parseFloat(tauxRemplissage.toFixed(2)),
      };
    },

    dashboardCalendar: async (_, { restaurantId, month }) => {
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      const start = moment.utc(month).startOf('month').toDate();
      const end = moment.utc(month).endOf('month').toDate();

      /*
       * Aggregate reservations for the month, filtering by the
       * restaurant's own _id and `source: 'new-ui'`.  This ensures
       * that the calendar heatmap only reflects bookings made via
       * the user-facing reservation pages.  Without this filter,
       * reservations from legacy channels could appear.
       */
      // @ts-ignore
      const reservations = await ReservationModel.find({
        businessId: restaurant._id,
        businessType: 'restaurant',
        source: 'new-ui',
        date: { $gte: start, $lte: end },
      }).select('date');

      const heatMap = reservations.reduce((acc: Record<string, number>, r: any) => {
        const dateStr = moment.utc(r.date).format('YYYY-MM-DD');
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(heatMap).map(([date, count]) => ({
        date,
        count,
      }));
    },

    reservationsByDate: async (_, { restaurantId, date }) => {
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      const targetDate = moment.utc(date).startOf('day').toDate();
      const nextDay = moment.utc(targetDate).add(1, 'days').toDate();

      /*
       * Retrieve reservations created on the specified day.  Match on the
       * restaurant's own ID and restrict to `source: 'new-ui'` to
       * include only bookings from the public reservation pages.  By
       * filtering on `createdAt` instead of `date` we surface
       * reservations made on the selected day regardless of when the
       * dining occurs.  This ensures the reservations list in the
       * dashboard reflects today’s revenue events rather than future
       * dining dates.
       */
      // @ts-ignore
      const reservations = await ReservationModel.find({
        businessId: restaurant._id,
        businessType: 'restaurant',
        source: 'new-ui',
        createdAt: { $gte: targetDate, $lt: nextDay },
      }).populate('businessId');

      return reservations.map((r) => {
        // Translate the internal reservation status to a French label used
        // by the dashboard UI.  Pending -> EN ATTENTE, confirmed ->
        // CONFIRMEE, cancelled -> ANNULEE.  Fallback to uppercase
        // English status if no match is found.
        let statutFr: string;
        switch (r.status) {
          case 'pending':
            statutFr = 'EN ATTENTE';
            break;
          case 'confirmed':
            statutFr = 'CONFIRMEE';
            break;
          case 'cancelled':
            statutFr = 'ANNULEE';
            break;
          default:
            statutFr = (r.status || '').toUpperCase();
        }
        return {
          id: r._id.toString(),
          date: moment.utc(r.date).format('YYYY-MM-DD'),
          heure: r.time,
          // Provide the restaurant ID as the value for the `restaurant` field.
          restaurant: (r.businessId as any)?._id?.toString() || (r.businessId as any)?.toString?.() || null,
          personnes: r.partySize,
          statut: statutFr,
        };
      });
    },
    // @ts-ignore
    availability: async (_, { restaurantId, date, partySize }) => {
      const restaurant = await RestaurantModel.findById(restaurantId).lean();
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }

      /**
       * Fetch the restaurant's settings and derive a schedule for generating
       * reservation slots.  We support two sources of opening hours:
       *   1. The settings.horaires array configured via the dashboard.
       *   2. The businessHours array which defines opening times per day of
       *      the week.  This is used as a fallback when no horaires are
       *      defined.
       */
      const settings: any = restaurant.settings || {};
      let horaires: any[] = Array.isArray(settings.horaires) && settings.horaires.length > 0
        ? settings.horaires
        : [];

        
      /*
       * Previously, when no horaires were configured in the restaurant settings,
       * the system attempted to derive opening hours from the separate
       * `businessHours` array configured on the restaurant.  This caused
       * unintended coupling between the dashboard "Business Hours" settings
       * and the table availability logic, which should rely solely on
       * `settings.horaires`.
       *
       * To ensure that the table availability page is not affected by
       * changes to Business Hours, we no longer derive horaires from
       * `businessHours`.  Instead, if no horaires are defined, we use a
       * sensible default time range of 12:00 to 22:00.  Restaurants can
       * explicitly configure their opening hours for reservations via the
       * tables-disponibilites page (which updates settings.horaires).
       */
      if (horaires.length === 0) {
        horaires = [
          {
            ouverture: '12:00',
            fermeture: '22:00',
          },
        ];
      }

      // Determine the slot frequency in minutes; default to 30 if not provided or invalid
      const frequency: number = typeof settings.frequenceCreneauxMinutes === 'number' && settings.frequenceCreneauxMinutes > 0
        ? settings.frequenceCreneauxMinutes
        : 30;

      // 1. Generate all possible slots for the day
      const allSlots: string[] = [];
      horaires.forEach(h => {
        if (!h.ouverture || !h.fermeture) return;
        let current = moment.utc(`${date}T${h.ouverture}`);
        const end = moment.utc(`${date}T${h.fermeture}`);
        while (current.isBefore(end)) {
          allSlots.push(current.format('HH:mm'));
          current.add(frequency, 'minutes');
        }
      });

      // 2. Get all confirmed or pending reservations for the day
      const startOfDay = moment.utc(date).startOf('day').toDate();
      const endOfDay = moment.utc(date).endOf('day').toDate();
      const reservations = await ReservationModel.find({
        // Match on the restaurant's own ID rather than the tenant/client ID.
        // This aligns with how reservations are created via
        // createReservationV2/createPrivatisationV2, which set
        // businessId to restaurant._id.
        businessId: restaurant._id,
        businessType: 'restaurant',
        date: { $gte: startOfDay, $lt: endOfDay },
        status: { $in: ['confirmed', 'pending'] },
      }).select('time partySize');

      // 3. Calculate the number of reservations per slot.
      // Instead of summing the party sizes, we count each reservation as a single booking.
      // Normalize reservation times to HH:mm (zero‑padded) before counting.  This prevents
      // mismatches between values like "9:00" and "09:00" which would otherwise
      // be treated as distinct keys.  Moment is used to format each time.
      const bookingsBySlot: Record<string, number> = {};
      reservations.forEach((r: any) => {
        if (!r.time) return;
        try {
          // Construct a full ISO date/time string using the provided date and the
          // reservation's time, then format to HH:mm.  Using the date ensures
          // moment.parse applies consistent timezone handling.  If parsing fails,
          // fall back to the raw time.
          const normalized = moment.utc(`${date}T${r.time}`).format('HH:mm');
          bookingsBySlot[normalized] = (bookingsBySlot[normalized] || 0) + 1;
        } catch (err) {
          // On error, increment the raw time key.
          bookingsBySlot[r.time] = (bookingsBySlot[r.time] || 0) + 1;
        }
      });

      // 4. Determine availability for each slot
      // A slot becomes unavailable as soon as the number of reservations reaches the configured maximum.  When
      // `maxReservationsParCreneau` is not set, default to 1 so that only a single reservation can be made per slot.
      const slotCapacity = settings.maxReservationsParCreneau || 1;
      const availabilitySlots = allSlots.map((slot) => {
        const currentCount = bookingsBySlot[slot] || 0;
        const available = currentCount < slotCapacity;
        return { time: slot, available };
      });
      return availabilitySlots;
    }
  },
  Mutation: {
    updateReservationDetails: async (_, { id, input }) => {
      const reservation = await ReservationModel.findById(id);
      if (!reservation) throw new GraphQLError('Reservation not found.');

      // TODO: Add capacity check logic here later

      const updatedReservation = await ReservationModel.findByIdAndUpdate(id, input, { new: true }).populate('businessId');

      return {
        id: updatedReservation._id.toString(),
        date: moment(updatedReservation.date).format('YYYY-MM-DD'),
        heure: updatedReservation.time,
        restaurant: updatedReservation.businessId ? (updatedReservation.businessId as any).name : 'N/A',
        personnes: updatedReservation.partySize,
        statut: updatedReservation.status.toUpperCase(),
      };
    },

    // cancelReservation: async (_, { id }) => {
    //   const cancelledReservation = await ReservationModel.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true }).populate('businessId');
    //   if (!cancelledReservation) throw new GraphQLError('Reservation not found.');

    //   return {
    //     id: cancelledReservation._id.toString(),
    //     date: moment(cancelledReservation.date).format('YYYY-MM-DD'),
    //     heure: cancelledReservation.time,
    //     restaurant: cancelledReservation.businessId ? (cancelledReservation.businessId as any).name : 'N/A',
    //     personnes: cancelledReservation.partySize,
    //     statut: cancelledReservation.status.toUpperCase(),
    //   };
    // }

    cancelReservationAdmin: async (_, { id }) => {
      const cancelledReservation = await ReservationModel.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true }
      ).populate('businessId');
      if (!cancelledReservation) throw new GraphQLError('Reservation not found.');
      return {
        id: cancelledReservation._id.toString(),
        date: moment(cancelledReservation.date).format('YYYY-MM-DD'),
        heure: cancelledReservation.time,
        restaurant: cancelledReservation.businessId ? (cancelledReservation.businessId as any).name : 'N/A',
        personnes: cancelledReservation.partySize,
        statut: cancelledReservation.status.toUpperCase(),
      };
    }

  },
  ReservationInfo: {
    restaurant: async ({ restaurant }, _, { Loaders }) => {
      try {
        return await restaurant ? Loaders.restaurant.load(restaurant) : null;
      }
      catch (error) {
        throw error;
      }
    }
  }
};
