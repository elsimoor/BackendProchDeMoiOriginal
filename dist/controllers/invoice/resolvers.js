"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceResolvers = void 0;
const InvoiceModel_1 = __importDefault(require("../../models/InvoiceModel"));
const ReservationModel_1 = __importDefault(require("../../models/ReservationModel"));
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Helper function to generate a PDF for a given invoice.  The PDF
 * includes basic invoice details such as invoice ID, date, reservation
 * information and a simple table of line items.  The returned
 * Promise resolves with a Buffer containing the PDF bytes.
 */
async function generateInvoicePdfBuffer(invoice) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch the reservation to enrich the invoice with additional
            // contextual information.  This allows us to include guest
            // details and stay dates in the invoice PDF.
            let reservation = null;
            if (invoice.reservationId) {
                reservation = await ReservationModel_1.default.findById(invoice.reservationId);
            }
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            // Header
            doc.fontSize(20).text('Invoice', { align: 'center' });
            doc.moveDown();
            // Invoice metadata
            doc.fontSize(12);
            doc.text(`Invoice ID: ${invoice._id}`);
            doc.text(`Date: ${invoice.date.toISOString().split('T')[0]}`);
            if (reservation) {
                doc.text(`Reservation ID: ${reservation._id}`);
                if (reservation.customerInfo) {
                    doc.text(`Customer: ${reservation.customerInfo.name}`);
                }
                if (reservation.checkIn && reservation.checkOut) {
                    const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
                    const checkOutDate = new Date(reservation.checkOut).toISOString().split('T')[0];
                    doc.text(`Stay: ${checkInDate} to ${checkOutDate}`);
                }
            }
            doc.moveDown();
            // Items table header
            doc.fontSize(14).text('Items', { underline: true });
            doc.moveDown(0.5);
            // Table columns: Description | Price | Qty | Total
            const tableTop = doc.y;
            const colX = [50, 280, 360, 440];
            doc.fontSize(12).text('Description', colX[0], tableTop);
            doc.text('Price', colX[1], tableTop);
            doc.text('Qty', colX[2], tableTop);
            doc.text('Total', colX[3], tableTop);
            doc.moveDown(0.5);
            invoice.items.forEach((item, idx) => {
                const y = tableTop + 20 * (idx + 1);
                doc.text(item.description, colX[0], y);
                doc.text(item.price.toFixed(2), colX[1], y);
                doc.text(item.quantity.toString(), colX[2], y);
                doc.text(item.total.toFixed(2), colX[3], y);
            });
            // Total
            doc.moveDown(2);
            doc.fontSize(14).text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.invoiceResolvers = {
    Query: {
        invoices: async (_parent, { businessId }) => {
            return InvoiceModel_1.default.find({ businessId }).sort({ date: -1 });
        },
        invoice: async (_parent, { id }) => {
            return InvoiceModel_1.default.findById(id);
        },
    },
    Mutation: {
        createInvoice: async (_parent, { input }) => {
            const { reservationId, businessId, items, total } = input;
            // Compute totals for each item; fallback to price * quantity
            const processedItems = items.map((item) => {
                const qty = item.quantity ?? 1;
                const tot = item.total ?? item.price * qty;
                return {
                    description: item.description,
                    price: item.price,
                    quantity: qty,
                    total: tot,
                };
            });
            const computedTotal = total ?? processedItems.reduce((sum, i) => sum + i.total, 0);
            const invoice = new InvoiceModel_1.default({
                reservationId,
                businessId,
                items: processedItems,
                total: computedTotal,
            });
            await invoice.save();
            return InvoiceModel_1.default.findById(invoice._id);
        },
        updateInvoice: async (_parent, { id, input }) => {
            const { items, total } = input;
            let processedItems = items;
            if (items) {
                processedItems = items.map((item) => {
                    const qty = item.quantity ?? 1;
                    const tot = item.total ?? item.price * qty;
                    return {
                        description: item.description,
                        price: item.price,
                        quantity: qty,
                        total: tot,
                    };
                });
            }
            const computedTotal = total ?? (processedItems ? processedItems.reduce((sum, i) => sum + i.total, 0) : undefined);
            const update = {};
            if (input.reservationId)
                update.reservationId = input.reservationId;
            if (input.businessId)
                update.businessId = input.businessId;
            if (processedItems)
                update.items = processedItems;
            if (computedTotal !== undefined)
                update.total = computedTotal;
            const invoice = await InvoiceModel_1.default.findByIdAndUpdate(id, update, { new: true });
            return invoice;
        },
        deleteInvoice: async (_parent, { id }) => {
            await InvoiceModel_1.default.findByIdAndDelete(id);
            return true;
        },
        generateInvoicePdf: async (_parent, { id }) => {
            const invoice = await InvoiceModel_1.default.findById(id);
            if (!invoice) {
                throw new Error('Invoice not found');
            }
            const buffer = await generateInvoicePdfBuffer(invoice);
            return buffer.toString('base64');
        },
    },
    Invoice: {
        // Resolve the reservation field by loading the reservation document
        reservation: async (parent) => {
            if (parent.reservationId) {
                return ReservationModel_1.default.findById(parent.reservationId);
            }
            return null;
        },
    },
};
//# sourceMappingURL=resolvers.js.map