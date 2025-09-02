"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceResolvers = void 0;
const InvoiceModel_1 = __importDefault(require("../../models/InvoiceModel"));
const ReservationModel_1 = __importDefault(require("../../models/ReservationModel"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const ClientModel_1 = __importDefault(require("../../models/ClientModel"));
const RestaurantModel_1 = __importDefault(require("../../models/RestaurantModel"));
const SalonModel_1 = __importDefault(require("../../models/SalonModel"));
const RoomModel_1 = __importDefault(require("../../models/RoomModel"));
/**
 * Helper function to generate a PDF for a given invoice.  The PDF
 * includes basic invoice details such as invoice ID, date, reservation
 * information and a simple table of line items.  The returned
 * Promise resolves with a Buffer containing the PDF bytes.
 */
async function generateInvoicePdfBuffer(invoice) {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch context
            let reservation = null;
            if (invoice.reservationId) {
                reservation = await ReservationModel_1.default.findById(invoice.reservationId);
            }
            const client = invoice.businessId ? await ClientModel_1.default.findById(invoice.businessId) : null;
            const brand = client?.name || 'Invoice';
            const currency = reservation ? await resolveCurrencyCodeFromReservation(reservation) : 'USD';
            const doc = new pdfkit_1.default({ margin: 50 });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            // @ts-ignore
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            // Header
            doc.fontSize(20).fillColor('#111827').text(brand, { align: 'left' });
            doc.moveTo(50, doc.y + 6).lineTo(545, doc.y + 6).strokeColor('#e5e7eb').stroke();
            doc.moveDown();
            // Invoice title and metadata
            doc.fontSize(18).fillColor('#111827').text('Invoice', { align: 'left' });
            doc.moveDown(0.25);
            doc.fontSize(12).fillColor('#374151');
            doc.text(`Invoice ID: ${invoice._id}`);
            doc.text(`Date: ${new Date(invoice.date).toISOString().split('T')[0]}`);
            if (reservation) {
                doc.text(`Reservation ID: ${reservation._id}`);
                if (reservation.customerInfo?.name)
                    doc.text(`Customer: ${reservation.customerInfo.name}`);
                if (reservation.checkIn && reservation.checkOut) {
                    const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
                    const checkOutDate = new Date(reservation.checkOut).toISOString().split('T')[0];
                    doc.text(`Stay: ${checkInDate} to ${checkOutDate}`);
                }
            }
            // Items table
            doc.moveDown(0.75);
            doc.fontSize(14).fillColor('#111827').text('Items', { underline: true });
            doc.moveDown(0.25);
            const startY = doc.y + 4;
            const colX = [50, 310, 380, 460]; // Description, Price, Qty, Total
            const lineHeight = 18;
            doc.fontSize(12).fillColor('#6b7280');
            doc.text('Description', colX[0], startY);
            doc.text('Price', colX[1], startY, { width: 60, align: 'right' });
            doc.text('Qty', colX[2], startY, { width: 40, align: 'right' });
            doc.text('Total', colX[3], startY, { width: 80, align: 'right' });
            doc.moveTo(50, startY + lineHeight).lineTo(545, startY + lineHeight).strokeColor('#e5e7eb').stroke();
            doc.fillColor('#374151');
            invoice.items.forEach((item, idx) => {
                const y = startY + lineHeight * (idx + 1);
                doc.text(item.description, colX[0], y);
                doc.text(formatCurrency(item.price, currency), colX[1], y, { width: 60, align: 'right' });
                doc.text(String(item.quantity), colX[2], y, { width: 40, align: 'right' });
                doc.text(formatCurrency(item.total, currency), colX[3], y, { width: 80, align: 'right' });
            });
            // Total
            doc.moveDown(2);
            doc.fontSize(14).fillColor('#111827').text(`Total: ${formatCurrency(invoice.total, currency)}`, { align: 'right' });
            // Footer
            doc.moveDown(1);
            doc.strokeColor('#e5e7eb').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.fontSize(10).fillColor('#6b7280').text('Thank you for your business!', 50, doc.y + 6, { align: 'left' });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
async function resolveCurrencyCodeFromReservation(reservation) {
    try {
        let code = 'USD';
        const type = (reservation.businessType || '').toLowerCase();
        if (type === 'restaurant') {
            const restaurant = await RestaurantModel_1.default.findOne({ clientId: reservation.businessId });
            const cur = restaurant?.settings?.currency;
            if (typeof cur === 'string' && cur)
                code = cur.toUpperCase();
        }
        else if (type === 'salon') {
            const salon = await SalonModel_1.default.findOne({ clientId: reservation.businessId });
            const cur = salon?.settings?.currency;
            if (typeof cur === 'string' && cur)
                code = cur.toUpperCase();
        }
        else if (type === 'hotel') {
            if (reservation.roomId) {
                const room = await RoomModel_1.default.findById(reservation.roomId).populate('hotelId');
                const hotel = room?.hotelId;
                const cur = hotel?.settings?.currency;
                if (typeof cur === 'string' && cur)
                    code = cur.toUpperCase();
            }
        }
        return code;
    }
    catch {
        return 'USD';
    }
}
function formatCurrency(amount, currency) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    }
    catch {
        return amount.toFixed(2);
    }
}
exports.invoiceResolvers = {
    Query: {
        invoices: async (_parent, { businessId, page, limit, }) => {
            const filter = { businessId };
            const pageNumber = page && page > 0 ? page : 1;
            const limitNumber = limit && limit > 0 ? limit : 10;
            // Paginate invoices sorted by creation date descending.
            return await InvoiceModel_1.default.paginate(filter, {
                page: pageNumber,
                limit: limitNumber,
                sort: { createdAt: -1 },
            });
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