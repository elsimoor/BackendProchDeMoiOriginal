"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationResolvers = void 0;
// reservation.resolvers.ts
// import {  AuthenticationError } from 'apollo-server-express';
const ReservationModel_1 = __importDefault(require("../../models/ReservationModel"));
const HotelModel_1 = __importDefault(require("../../models/HotelModel"));
const InvoiceModel_1 = __importDefault(require("../../models/InvoiceModel"));
const pdfkit_1 = __importDefault(require("pdfkit"));
exports.reservationResolvers = {
    Query: {
        reservations: async (_parent, { businessId, businessType, status, date }) => {
            const filter = { businessId, businessType };
            if (status)
                filter.status = status;
            if (date) {
                const startDate = new Date(date);
                const endDate = new Date(date);
                endDate.setDate(endDate.getDate() + 1);
                filter.date = { $gte: startDate, $lt: endDate };
            }
            return ReservationModel_1.default.find(filter)
                .sort({ date: -1 });
        },
        reservation: async (_parent, { id }) => {
            return ReservationModel_1.default.findById(id);
        }
    },
    Mutation: {
        createReservation: async (_parent, { input }) => {
            // If the reservation is for a hotel, validate against opening periods
            if (input.businessType && input.businessType.toLowerCase() === 'hotel') {
                const hotel = await HotelModel_1.default.findById(input.businessId);
                if (hotel && hotel.openingPeriods && hotel.openingPeriods.length > 0) {
                    // Determine reservation start and end dates.  We support two patterns:
                    // 1) Hotel reservations with checkIn and checkOut
                    // 2) Generic reservation with a single date (for services)
                    const checkIn = input.checkIn ? new Date(input.checkIn) : (input.date ? new Date(input.date) : null);
                    const checkOut = input.checkOut ? new Date(input.checkOut) : null;
                    // If no checkOut, treat it as a one‑day reservation
                    const startDate = checkIn;
                    const endDate = checkOut || checkIn;
                    if (startDate && endDate) {
                        const isWithinAnyPeriod = hotel.openingPeriods.some((period) => {
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
            const reservation = new ReservationModel_1.default(input);
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
                    const invoice = new InvoiceModel_1.default({
                        reservationId: reservation._id,
                        businessId: reservation.businessId,
                        items,
                        total: amount,
                    });
                    await invoice.save();
                }
            }
            catch (err) {
                console.error('Failed to create invoice for reservation', err);
            }
            return ReservationModel_1.default.findById(reservation._id);
        },
        /**
         * Confirm a pending reservation after successful payment.  This
         * mutation updates the status to "confirmed" and the paymentStatus
         * to "paid".  An invoice is generated if one does not already
         * exist.  If the reservation does not exist an error is thrown.
         */
        confirmReservation: async (_parent, { id }) => {
            const reservation = await ReservationModel_1.default.findById(id);
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            reservation.status = 'confirmed';
            reservation.paymentStatus = 'paid';
            await reservation.save();
            try {
                // Generate an invoice only if one does not already exist.
                const existing = await InvoiceModel_1.default.findOne({ reservationId: reservation._id });
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
                    const invoice = new InvoiceModel_1.default({
                        reservationId: reservation._id,
                        businessId: reservation.businessId,
                        items,
                        total: amount,
                    });
                    await invoice.save();
                }
            }
            catch (err) {
                console.error('Failed to create invoice during confirmation', err);
            }
            return reservation;
        },
        /**
         * Cancel a pending reservation if the user aborts the Stripe
         * checkout.  Removing the reservation ensures no record or
         * invoice remains for unpaid bookings.  Returns true when a
         * reservation was deleted and false if no reservation was found.
         */
        cancelReservation: async (_parent, { id }) => {
            const reservation = await ReservationModel_1.default.findByIdAndDelete(id);
            if (reservation) {
                try {
                    await InvoiceModel_1.default.deleteMany({ reservationId: reservation._id });
                }
                catch (err) {
                    console.error('Failed to remove invoice during cancellation', err);
                }
                return true;
            }
            return false;
        },
        updateReservation: async (_parent, { id, input }) => {
            const reservation = await ReservationModel_1.default.findByIdAndUpdate(id, input, { new: true });
            return reservation;
        },
        deleteReservation: async (_parent, { id }) => {
            // if (!user) {
            //   throw new AuthenticationError('Not authenticated');
            // }
            await ReservationModel_1.default.findByIdAndDelete(id);
            return true;
        },
        /**
         * Generate a PDF summary for a reservation. The PDF includes essential
         * details such as reservation identifier, status, payment status,
         * customer information and booking specifics.  A base64-encoded
         * representation of the PDF is returned.  Throws an error if
         * the reservation does not exist.
         */
        generateReservationPdf: async (_parent, { id }) => {
            const reservation = await ReservationModel_1.default.findById(id);
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
    }
};
/**
 * Helper function to construct a PDF summarising a reservation.  This
 * function creates a simple PDF with sections for basic metadata
 * (ID, status), customer details and booking‑specific fields
 * depending on the business type.  A Buffer containing the PDF
 * bytes is returned.
 */
async function generateReservationPdfBuffer(reservation) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
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
            }
            else if (reservation.businessType === 'restaurant') {
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
            }
            else if (reservation.businessType === 'salon') {
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
        }
        catch (err) {
            reject(err);
        }
    });
}
//# sourceMappingURL=resolvers.js.map