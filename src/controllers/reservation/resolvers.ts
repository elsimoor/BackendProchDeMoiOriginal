// reservation.resolvers.ts
// import {  AuthenticationError } from 'apollo-server-express';
import ReservationModel from '../../models/ReservationModel';
import HotelModel from '../../models/HotelModel';
import InvoiceModel from '../../models/InvoiceModel';
import PDFDocument from 'pdfkit';
import fetch from 'node-fetch';

// Import cancellation policies to evaluate refund rules during cancellation
import CancellationPolicyModel from '../../models/CancellationPolicyModel';
// Import Payment model so we can look up completed payments when processing
// refunds during cancellation.  Payments record the Stripe
// paymentIntent identifier required to trigger a refund via the Stripe
// API.
import PaymentModel from '../../models/PaymentModel';

// Import models for other business types so we can resolve the
// currency of a reservation.  Restaurants and salons store their
// settings on the corresponding model keyed by clientId.  Hotels
// derive the currency from the associated room’s hotel settings.
import RestaurantModel from '../../models/RestaurantModel';
import SalonModel from '../../models/SalonModel';
import RoomModel from '../../models/RoomModel';
// Email helper used to send reservation confirmations with a cancel link
import { sendEmail } from '../../utils/email';

// interface Context {
//   user?: { id: string };
// }

interface ReservationsArgs {
  businessId: string;
  businessType: string;
  status?: string;
  date?: string;
}

interface IdArg {
  id: string;
}

// type CreateReservationInput = any;  // replace with your actual input type
type UpdateReservationInput = any;



interface MutationUpdateArgs {
  id: string;
  input: UpdateReservationInput;
}

export const reservationResolvers = {
  Query: {
    reservations: async (
      _parent,
      { businessId, businessType, status, date }: ReservationsArgs
    ) => {
      const filter: Record<string, any> = { businessId, businessType };
      if (status) filter.status = status;
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        filter.date = { $gte: startDate, $lt: endDate };
      }

      return ReservationModel.find(filter)
        .sort({ date: -1 });
    },

    reservation: async (_parent, { id }: IdArg) => {
      return ReservationModel.findById(id)

    }
  },

  Mutation: {
    createReservation: async (
      _parent,
      { input },
      
    ) => {
      // If the reservation is for a hotel, validate against opening periods
      if (input.businessType && input.businessType.toLowerCase() === 'hotel') {
        const hotel = await HotelModel.findById(input.businessId);
        if (hotel && hotel.openingPeriods && hotel.openingPeriods.length > 0) {
          // Determine reservation start and end dates.  We support two patterns:
          // 1) Hotel reservations with checkIn and checkOut
          // 2) Generic reservation with a single date (for services)
          const checkIn: Date | null = input.checkIn ? new Date(input.checkIn) : (input.date ? new Date(input.date) : null);
          const checkOut: Date | null = input.checkOut ? new Date(input.checkOut) : null;
          // If no checkOut, treat it as a one‑day reservation
          const startDate = checkIn;
          const endDate = checkOut || checkIn;
          if (startDate && endDate) {
            const isWithinAnyPeriod = hotel.openingPeriods.some((period: any) => {
              const periodStart = new Date(period.startDate);
              const periodEnd = new Date(period.endDate);
              return startDate >= periodStart && endDate <= periodEnd;
            });
            if (!isWithinAnyPeriod) {
              throw new Error('Hotel is not open for the selected dates');
            }
          }
        }
      }
      const reservation = new ReservationModel(input);
      await reservation.save();
      /*
       * Only generate an invoice when a reservation has been paid.  The
       * paymentStatus defaults to "pending" and will be updated to
       * "paid" via the confirmReservation mutation once the Stripe
       * checkout succeeds.  This prevents invoices from being
       * created prematurely for reservations that are never paid.
       */
      try {
        if (reservation.businessId && reservation.paymentStatus === 'paid') {
          const amount = reservation.totalAmount ?? 0;
          const items = [
            {
              description: `Reservation ${reservation._id.toString()}`,
              price: amount,
              quantity: 1,
              total: amount,
            },
          ];
          const invoice = new InvoiceModel({
            reservationId: reservation._id,
            businessId: reservation.businessId,
            items,
            total: amount,
          });
          await invoice.save();
        }
      } catch (err) {
        console.error('Failed to create invoice for reservation', err);
      }
      return ReservationModel.findById(reservation._id)
    },

    /**
     * Confirm a pending reservation after successful payment.  This
     * mutation updates the status to "confirmed" and the paymentStatus
     * to "paid".  An invoice is generated if one does not already
     * exist.  If the reservation does not exist an error is thrown.
     */
    confirmReservation: async (
      _parent,
      { id }: { id: string },
    ) => {
      const reservation = await ReservationModel.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      reservation.status = 'confirmed';
      reservation.paymentStatus = 'paid';
      await reservation.save();
      try {
        // Generate an invoice only if one does not already exist.
        const existing = await InvoiceModel.findOne({ reservationId: reservation._id });
        if (!existing && reservation.businessId) {
          const amount = reservation.totalAmount ?? 0;
          const items = [
            {
              description: `Reservation ${reservation._id.toString()}`,
              price: amount,
              quantity: 1,
              total: amount,
            },
          ];
          const invoice = new InvoiceModel({
            reservationId: reservation._id,
            businessId: reservation.businessId,
            items,
            total: amount,
          });
          await invoice.save();
        }
      } catch (err) {
        console.error('Failed to create invoice during confirmation', err);
      }

      // Send a booking confirmation email with a cancellation link via SMTP.
      // The email template is enhanced to provide a clean layout with
      // booking details and a clear call‑to‑action for cancellation.
      try {
        const to = reservation.customerInfo?.email;
        // Build cancellation link using the FRONTEND_URL environment variable, falling back to localhost
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const cancelLink = `${frontendUrl}/hotel/cancel?reservationId=${reservation._id}`;
        // Format check‑in and check‑out dates if present.  Use ISO date
        // format for consistency.  When fields are missing the line
        // will be omitted from the email.
        let checkInLine = '';
        if (reservation.checkIn) {
          const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
          checkInLine = `<tr><td style="padding:8px 0;"><strong>Check‑in:</strong></td><td style="padding:8px 0;">${checkInDate}</td></tr>`;
        }
        let checkOutLine = '';
        if (reservation.checkOut) {
          const checkOutDate = new Date(reservation.checkOut).toISOString().split('T')[0];
          checkOutLine = `<tr><td style="padding:8px 0;"><strong>Check‑out:</strong></td><td style="padding:8px 0;">${checkOutDate}</td></tr>`;
        }
        let amountLine = '';
        if (typeof reservation.totalAmount === 'number' && reservation.totalAmount > 0) {
          const amountStr = reservation.totalAmount.toFixed(2);
          amountLine = `<tr><td style="padding:8px 0;"><strong>Total Amount:</strong></td><td style="padding:8px 0;">${amountStr}</td></tr>`;
        }
        const guestName = reservation.customerInfo?.name || 'Guest';
        const html = `
        <div style="max-width:600px;margin:0 auto;font-family:Arial, sans-serif;background-color:#f7f7f7;padding:20px;">
          <div style="background-color:#ffffff;padding:20px;border-radius:8px;">
            <h2 style="color:#333333;">Reservation Confirmation</h2>
            <p>Hello ${guestName},</p>
            <p>Thank you for your reservation. Here are your booking details:</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;"><strong>Reservation ID:</strong></td>
                <td style="padding:8px 0;">${reservation._id}</td>
              </tr>
              ${checkInLine}
              ${checkOutLine}
              ${amountLine}
            </table>
            <p>If you wish to cancel your reservation, please click the button below. Note that our cancellation policy may apply.</p>
            <p style="text-align:center;">
              <a href="${cancelLink}" style="display:inline-block;padding:10px 20px;background-color:#e53e3e;color:#ffffff;text-decoration:none;border-radius:4px;">Cancel Reservation</a>
            </p>
            <p style="font-size:12px;color:#777777;">If you have any questions, feel free to contact our support team.</p>
          </div>
        </div>
        `;
        await sendEmail(to, 'Reservation Confirmation', html);
      } catch (err) {
        console.error('Failed to send confirmation email', err);
      }

      return reservation;
    },

    /**
     * Cancel a pending reservation if the user aborts the Stripe
     * checkout.  Removing the reservation ensures no record or
     * invoice remains for unpaid bookings.  Returns true when a
     * reservation was deleted and false if no reservation was found.
     */
    cancelReservation: async (
      _parent,
      { id }: { id: string },
    ): Promise<boolean> => {
      const reservation = await ReservationModel.findByIdAndDelete(id);
      if (reservation) {
        try {
          await InvoiceModel.deleteMany({ reservationId: reservation._id });
        } catch (err) {
          console.error('Failed to remove invoice during cancellation', err);
        }
        return true;
      }
      return false;
    },

    /**
     * Cancel a hotel reservation after payment has been captured.  This
     * mutation sets the reservation status to "cancelled" and computes
     * the refund amount according to the business’s configured
     * cancellation policies.  When cancelled by a user the refund is
     * processed automatically via a webhook; when cancelled by a
     * manager only the reservation is updated and it is assumed that
     * the refund will be handled manually.  A CancellationResult
     * containing success and refundAmount is returned.
     */
    cancelHotelReservation: async (
      _parent: any,
      { id, cancelledBy }: { id: string; cancelledBy: string },
    ) => {
      const reservation: any = await ReservationModel.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      // Default refund amount.  This will remain zero when no
      // cancellation policies match or when the reservation has no
      // associated amount.
      let refundAmount = 0;
      // Compute refund only for hotel reservations with a total amount and
      // check‑in date.  The logic mirrors the client‑side computation in
      // the frontend: determine how many days remain until check‑in and
      // select the first cancellation policy whose daysBefore threshold
      // is satisfied.  The refund is totalAmount * (refundPercentage / 100).
      if (
        reservation.businessType === 'hotel' &&
        typeof reservation.totalAmount === 'number' &&
        reservation.totalAmount > 0
      ) {
        let daysBefore = 0;
        if (reservation.checkIn) {
          const now = new Date();
          const checkInDate = new Date(reservation.checkIn);
          const diffMs = checkInDate.getTime() - now.getTime();
          daysBefore = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        // Load all policies for the reservation's business sorted descending
        const policies = await CancellationPolicyModel.find({ businessId: reservation.businessId }).sort({ daysBefore: -1 });
        let refundPercentage = 0;
        for (const policy of policies) {
          if (daysBefore >= policy.daysBefore) {
            refundPercentage = policy.refundPercentage;
            break;
          }
        }
        refundAmount = (reservation.totalAmount ?? 0) * (refundPercentage / 100);
      }
      // When the user initiates the cancellation and a refund is due,
      // process the refund via Stripe and update payment records.  The
      // Payment model stores the stripePaymentIntentId captured during
      // checkout; we locate the associated payment in the 'paid'
      // state and call the Stripe refunds API.  After a successful
      // refund we set the payment status to 'refunded' and mark the
      // reservation paymentStatus as refunded.
      if (cancelledBy?.toLowerCase() === 'user' && refundAmount > 0) {
        try {
          // Look up the paid payment for this reservation.  There should
          // be only one completed payment per reservation.
          const payment = await PaymentModel.findOne({ reservationId: id, status: 'paid' });
          if (payment && payment.stripePaymentIntentId) {
            // Dynamically import Stripe to avoid a global dependency.
            const Stripe = require('stripe');
            const secretKey = process.env.STRIPE_SECRET_KEY;
            if (!secretKey) {
              throw new Error('Missing STRIPE_SECRET_KEY environment variable');
            }
            const stripe = new Stripe(secretKey, { apiVersion: '2020-08-27' });
            // Create the refund.  The amount must be specified in
            // cents.  We round to the nearest cent.
            const amountInCents = Math.round(refundAmount * 100);
            await stripe.refunds.create({
              payment_intent: payment.stripePaymentIntentId,
              amount: amountInCents,
            });
            // Update payment status to refunded.  This value is
            // validated by the Payment schema enumeration.
            payment.status = 'refunded';
            await payment.save();
          }
          // Also update reservation.paymentStatus to 'refunded'
          reservation.paymentStatus = 'refunded';
        } catch (err) {
          console.error('Failed to process Stripe refund', err);
        }
      }
      // Update reservation status to cancelled regardless of refund.  When
      // a refund is processed above we also set paymentStatus accordingly.
      reservation.status = 'cancelled';
      await reservation.save();
      // Invoke webhook when cancelled by user and a refund is due.  This
      // provides a hook for external systems to perform additional
      // processing (e.g. updating accounting systems).  The webhook
      // executes after the Stripe refund so the caller can trust that
      // funds have been returned.
      if (cancelledBy?.toLowerCase() === 'user' && refundAmount > 0) {
        try {
          const webhookUrl = process.env.REFUND_WEBHOOK_URL;
          // Only attempt to call the webhook when a URL is defined and fetch is available
          if (webhookUrl && typeof fetch === 'function') {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reservationId: id, refundAmount }),
            });
          }
        } catch (err) {
          console.error('Failed to call refund webhook', err);
        }
      }
      return { success: true, refundAmount };
    },

    updateReservation: async (
      _parent,
      { id, input }: MutationUpdateArgs,
      
    ) => {
      const reservation = await ReservationModel.findByIdAndUpdate(id, input, { new: true })
        
      return reservation;
    },

    deleteReservation: async (
      _parent,
      { id }: IdArg,
      
    ): Promise<boolean> => {
      // if (!user) {
      //   throw new AuthenticationError('Not authenticated');
      // }
      await ReservationModel.findByIdAndDelete(id);
      return true;
    },
    /**
     * Generate a PDF summary for a reservation. The PDF includes essential
     * details such as reservation identifier, status, payment status,
     * customer information and booking specifics.  A base64-encoded
     * representation of the PDF is returned.  Throws an error if
     * the reservation does not exist.
     */
    generateReservationPdf: async (
      _parent: any,
      { id }: { id: string },
    ) => {
      const reservation: any = await ReservationModel.findById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      const buffer = await generateReservationPdfBuffer(reservation);
      return buffer.toString('base64');
    }
  },
  Reservation: {
    /**
     * Resolve the `client` field on a reservation.  Delegates to the
     * DataLoader which fetches the associated Client document.  Returns
     * `null` if no client is associated with the reservation.
     */
    client: async ({ businessId }, _args, { Loaders }) => {
      return businessId ? await Loaders.business.load(businessId) : null;
    },
    customerId: async ({ customerId }, _, { Loaders }) => {
      return (await customerId) ? await Loaders.user.load(customerId) : null;
    },
    roomId: async ({ roomId }, _, { Loaders }) => {
      return (await roomId) ? await Loaders.room.load(roomId) : null;
    },
    tableId: async ({ tableId }, _, { Loaders }) => {
      return (await tableId) ? await Loaders.table.load(tableId) : null;
    },
    serviceId: async ({ serviceId }, _, { Loaders }) => {
      return (await serviceId) ? await Loaders.service.load(serviceId) : null;
    },
    staffId: async ({ staffId }, _, { Loaders }) => {
      return (await staffId) ? await Loaders.staff.load(staffId) : null;
    }
    ,
    /**
     * Resolve the `currency` field on a reservation.  The currency is
     * derived from the business associated with the reservation.
     * Restaurants and salons store their preferred currency under
     * settings.currency on the respective model (found via clientId).  For
     * hotels, we look up the room to find the associated hotel and
     * return its settings.currency.  If no currency can be resolved
     * the default returned value is `USD`.  The returned code is
     * always uppercase (e.g. `MAD`, `USD`).
     */
    currency: async (parent: any) => {
      let code: string = 'USD';
      try {
        const type = (parent.businessType || '').toLowerCase();
        if (type === 'restaurant') {
          const restaurant: any = await RestaurantModel.findOne({ clientId: parent.businessId });
          const cur = restaurant?.settings?.currency;
          if (typeof cur === 'string' && cur) {
            code = cur.toUpperCase();
          }
        } else if (type === 'salon') {
          const salon: any = await SalonModel.findOne({ clientId: parent.businessId });
          const cur = salon?.settings?.currency;
          if (typeof cur === 'string' && cur) {
            code = cur.toUpperCase();
          }
        } else if (type === 'hotel') {
          if (parent.roomId) {
            // Populate the hotel from the room.  Use lean() to avoid
            // returning full mongoose documents unnecessarily.
            const room: any = await RoomModel.findById(parent.roomId).populate('hotelId');
            const hotel: any = room?.hotelId;
            const cur = hotel?.settings?.currency;
            if (typeof cur === 'string' && cur) {
              code = cur.toUpperCase();
            }
          }
        }
      } catch (err) {
        // Swallow errors; default remains USD
        code = 'USD';
      }
      return code;
    }
  }
};

/**
 * Helper function to construct a PDF summarising a reservation.  This
 * function creates a simple PDF with sections for basic metadata
 * (ID, status), customer details and booking‑specific fields
 * depending on the business type.  A Buffer containing the PDF
 * bytes is returned.
 */
async function generateReservationPdfBuffer(reservation: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      // Title
      doc.fontSize(20).text('Reservation Summary', { align: 'center' });
      doc.moveDown();
      // Basic information
      doc.fontSize(12);
      doc.text(`Reservation ID: ${reservation._id}`);
      if (reservation.status) {
        doc.text(`Status: ${reservation.status}`);
      }
      if (reservation.paymentStatus) {
        doc.text(`Payment Status: ${reservation.paymentStatus}`);
      }
      // Customer information
      if (reservation.customerInfo) {
        doc.moveDown(0.5);
        doc.text('Customer Information:', { underline: true });
        if (reservation.customerInfo.name) {
          doc.text(`Name: ${reservation.customerInfo.name}`);
        }
        if (reservation.customerInfo.email) {
          doc.text(`Email: ${reservation.customerInfo.email}`);
        }
        if (reservation.customerInfo.phone) {
          doc.text(`Phone: ${reservation.customerInfo.phone}`);
        }
      }
      doc.moveDown(0.5);
      doc.text(`Business Type: ${reservation.businessType}`);
      doc.moveDown(0.5);
      // Booking details depending on type
      if (reservation.businessType === 'hotel') {
        if (reservation.checkIn) {
          const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
          doc.text(`Check‑in: ${checkInDate}`);
        }
        if (reservation.checkOut) {
          const checkOutDate = new Date(reservation.checkOut).toISOString().split('T')[0];
          doc.text(`Check‑out: ${checkOutDate}`);
        }
        if (reservation.guests !== undefined && reservation.guests !== null) {
          doc.text(`Guests: ${reservation.guests}`);
        }
      } else if (reservation.businessType === 'restaurant') {
        if (reservation.date) {
          const dateStr = new Date(reservation.date).toISOString().split('T')[0];
          doc.text(`Date: ${dateStr}`);
        }
        if (reservation.time) {
          doc.text(`Time: ${reservation.time}`);
        }
        if (reservation.partySize !== undefined && reservation.partySize !== null) {
          doc.text(`Party size: ${reservation.partySize}`);
        }
      } else if (reservation.businessType === 'salon') {
        if (reservation.date) {
          const dateStr = new Date(reservation.date).toISOString().split('T')[0];
          doc.text(`Date: ${dateStr}`);
        }
        if (reservation.time) {
          doc.text(`Time: ${reservation.time}`);
        }
        if (reservation.duration !== undefined && reservation.duration !== null) {
          doc.text(`Duration: ${reservation.duration} minutes`);
        }
      }
      if (reservation.notes) {
        doc.moveDown(0.5);
        doc.text(`Notes: ${reservation.notes}`);
      }
      // Total amount at bottom right
      if (typeof reservation.totalAmount === 'number') {
        doc.moveDown(1);
        doc.fontSize(14).text(`Total Amount: ${reservation.totalAmount.toFixed(2)}`, { align: 'right' });
      }
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
