import PaymentModel from '../../models/PaymentModel';
import ReservationModel from '../../models/ReservationModel';
import InvoiceModel from '../../models/InvoiceModel';
import RestaurantModel from '../../models/RestaurantModel';
import SalonModel from '../../models/SalonModel';
import RoomModel from '../../models/RoomModel';
// Import restaurant and salon models so we can resolve the owning client when
// listing payments for those business types.  Some payment records may
// reference either a restaurant/salon identifier or the underlying client
// identifier depending on how reservations were created.  Including these
// models enables us to search for payments using both IDs.

// Lazy import stripe to avoid circular dependencies during tests.  We
// require the module only when a payment session is created.
let stripeInstance: any;
function getStripe() {
  if (!stripeInstance) {
    // @ts-ignore dynamic import
    const Stripe = require('stripe');
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2020-08-27',
    });
  }
  return stripeInstance;
}

export const paymentResolvers = {
  Query: {
    // List payments belonging to a business.  Sorted by most recent first.
    payments: async (_parent: any, { businessId }: { businessId: string }) => {
      /**
       * When fetching payments for a business we accept the identifier of the
       * current dashboard context (hotel, restaurant or salon).  Payment
       * records are created with `businessId` equal to either the specific
       * business (e.g. a restaurant or salon) or the owning client.  This
       * depends on how the reservation was created and the state of the code
       * at the time.  To ensure we return all relevant payments we build a
       * list of possible identifiers to search on:
       *   - the provided businessId itself
       *   - the clientId of the restaurant (if businessId refers to a restaurant)
       *   - the clientId of the salon (if businessId refers to a salon)
       *
       * We then query payments where the businessId matches any of these
       * identifiers.  Duplicates are removed via `Set` to avoid redundant
       * conditions.  Payments are sorted by newest first.
       */
      const ids: string[] = [businessId];
      try {
        // Check if the provided ID corresponds to a restaurant and, if so,
        // include its clientId.  Some payment records for table bookings may
        // have been created against the client rather than the restaurant.
        const restaurant = await RestaurantModel.findById(businessId).select('clientId').lean();
        if (restaurant && restaurant.clientId) {
          ids.push(restaurant.clientId.toString());
        }
      } catch (err) {
        // Ignore errors when looking up restaurants
      }
      try {
        // Check if the provided ID corresponds to a salon and include its
        // clientId if present.  This mirrors the logic for restaurants.
        const salon:any = await SalonModel.findById(businessId).select('clientId').lean();
        if (salon && salon.clientId) {
          ids.push(salon.clientId.toString());
        }
      } catch (err) {
        // Ignore errors when looking up salons
      }
      // Deduplicate identifiers
      const uniqueIds = Array.from(new Set(ids));
      return PaymentModel.find({ businessId: { $in: uniqueIds } }).sort({ createdAt: -1 });
    },
    // Fetch a single payment by identifier.
    payment: async (_parent: any, { id }: { id: string }) => {
      return PaymentModel.findById(id);
    },
  },
  Mutation: {
    // Initiate a Stripe checkout session for a reservation.  A payment record
    // is created prior to initiating the session so that the webhook can
    // reference it via metadata.  The session id and URL are returned
    // to the caller for redirection.
    createPaymentSession: async (
      _parent: any,
      { input }: { input: { reservationId: string; successUrl: string; cancelUrl: string } }
    ) => {
      const { reservationId, successUrl, cancelUrl } = input;
      // Look up the reservation.  Throw if not found.
      const reservation = await ReservationModel.findById(reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      const businessId = reservation.businessId;
      // Determine the amount to charge.  Use reservation.totalAmount if set,
      // otherwise fallback to the associated invoice total if present.
      let amount = reservation.totalAmount || 0;
      if (!amount || amount <= 0) {
        const invoice = await InvoiceModel.findOne({ reservationId: reservation._id });
        if (invoice) {
          amount = invoice.total || 0;
        }
      }
      // Amount must be positive.  If it's zero, throw an error or allow free checkout.
      if (!amount || amount <= 0) {
        throw new Error('Invalid reservation amount');
      }
      // Determine the currency for the payment.  By default use USD but
      // attempt to resolve the currency from the owning business.  For
      // restaurants and salons the currency is stored on the settings
      // object of the business associated with the clientId.  For hotels
      // we derive it from the associated room's hotel settings.  When
      // the currency cannot be determined we fallback to USD.
      let currency: string = 'USD';
      try {
        const type = (reservation.businessType || '').toLowerCase();
        if (type === 'restaurant') {
          // Find the restaurant by clientId; some reservations store
          // businessId as the client identifier.  If the restaurant
          // exists and defines a currency, use it.
          const restaurant: any = await RestaurantModel.findOne({ clientId: businessId });
          const cur = restaurant?.settings?.currency;
          if (cur) currency = cur;
        } else if (type === 'salon') {
          const salon: any = await SalonModel.findOne({ clientId: businessId });
          const cur = salon?.settings?.currency;
          if (cur) currency = cur;
        } else if (type === 'hotel') {
          // For hotel bookings the businessId refers to the client.  We
          // determine the hotel by looking up the room and its
          // associated hotelId, then reading the hotel settings.
          if (reservation.roomId) {
            const room: any = await RoomModel.findById(reservation.roomId).populate('hotelId');
            const hotel: any = room?.hotelId;
            const cur = hotel?.settings?.currency;
            if (cur) currency = cur;
          }
        }
      } catch (err) {
        // If any lookup fails, currency remains the default
      }
      // Normalize to lowercase for Stripe API; Stripe expects ISO
      // currency codes in lowercase.
      const stripeCurrency = (currency || 'USD').toLowerCase();
      // Create a new payment record with pending status.  This record
      // associates the reservation and business, storing the amount and
      // currency used.
      const paymentRecord = new PaymentModel({
        reservationId: reservation._id,
        businessId: businessId,
        amount: amount,
        currency: stripeCurrency,
        status: 'pending',
      });
      await paymentRecord.save();
      // Create the Stripe checkout session.  Use the amount in cents as
      // required by Stripe.  The metadata includes the payment id and
      // reservation id so that webhook handlers can update the correct
      // records when the payment completes.
      const stripe = getStripe();
      const unitAmount = Math.round(amount * 100);
      // Append the session_id parameter to the success URL.  If
      // successUrl already contains a query string (e.g. because a
      // reservationId was provided) then append with '&'; otherwise use '?'.
      const separator = successUrl.includes('?') ? '&' : '?';
      const successUrlWithSession = `${successUrl}${separator}session_id={CHECKOUT_SESSION_ID}`;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: stripeCurrency,
              unit_amount: unitAmount,
              product_data: {
                name: `Reservation ${reservation._id.toString()}`,
                description: `Payment for reservation ${reservation._id.toString()}`,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrlWithSession,
        cancel_url: cancelUrl,
        metadata: {
          paymentId: paymentRecord._id.toString(),
          reservationId: reservation._id.toString(),
          businessId: businessId.toString(),
          businessType: reservation.businessType || '',
        },
      });
      // Update the payment record with the session id.  We leave status as
      // pending until the webhook updates it.
      paymentRecord.stripeSessionId = session.id;
      await paymentRecord.save();
      return { sessionId: session.id, url: session.url };
    },
  },

  // Provide field resolvers for nested entities.  These allow clients
  // to fetch the associated reservation and invoice documents for a
  // payment.  We reuse the existing Mongoose models to retrieve the
  // related records.  If no reservationId or invoiceId exists the
  // resolver returns null.
  Payment: {
    reservation: async (parent: any) => {
      if (parent.reservationId) {
        return ReservationModel.findById(parent.reservationId);
      }
      return null;
    },
    invoice: async (parent: any) => {
      if (parent.invoiceId) {
        return InvoiceModel.findById(parent.invoiceId);
      }
      return null;
    },
  },
};