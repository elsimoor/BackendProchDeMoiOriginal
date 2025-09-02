import InvoiceModel from '../../models/InvoiceModel';
import ReservationModel from '../../models/ReservationModel';
import PDFDocument from 'pdfkit';
import ClientModel from '../../models/ClientModel';
import RestaurantModel from '../../models/RestaurantModel';
import SalonModel from '../../models/SalonModel';
import RoomModel from '../../models/RoomModel';

/**
 * Helper function to generate a PDF for a given invoice.  The PDF
 * includes basic invoice details such as invoice ID, date, reservation
 * information and a simple table of line items.  The returned
 * Promise resolves with a Buffer containing the PDF bytes.
 */
async function generateInvoicePdfBuffer(invoice: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch context
      let reservation: any = null;
      if (invoice.reservationId) {
        reservation = await ReservationModel.findById(invoice.reservationId);
      }
      const client = invoice.businessId ? await ClientModel.findById(invoice.businessId) : null;
      const brand = client?.name || 'Invoice';
      const currency = reservation ? await resolveCurrencyCodeFromReservation(reservation) : 'USD';

      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk as Buffer));
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
        if (reservation.customerInfo?.name) doc.text(`Customer: ${reservation.customerInfo.name}`);
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
      invoice.items.forEach((item: any, idx: number) => {
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
    } catch (err) {
      reject(err);
    }
  });
}

async function resolveCurrencyCodeFromReservation(reservation: any): Promise<string> {
  try {
    let code = 'USD';
    const type = (reservation.businessType || '').toLowerCase();
    if (type === 'restaurant') {
      const restaurant: any = await RestaurantModel.findOne({ clientId: reservation.businessId });
      const cur = restaurant?.settings?.currency;
      if (typeof cur === 'string' && cur) code = cur.toUpperCase();
    } else if (type === 'salon') {
      const salon: any = await SalonModel.findOne({ clientId: reservation.businessId });
      const cur = salon?.settings?.currency;
      if (typeof cur === 'string' && cur) code = cur.toUpperCase();
    } else if (type === 'hotel') {
      if (reservation.roomId) {
        const room: any = await RoomModel.findById(reservation.roomId).populate('hotelId');
        const hotel: any = room?.hotelId;
        const cur = hotel?.settings?.currency;
        if (typeof cur === 'string' && cur) code = cur.toUpperCase();
      }
    }
    return code;
  } catch {
    return 'USD';
  }
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

export const invoiceResolvers = {
  Query: {
    invoices: async (
      _parent: any,
      {
        businessId,
        page,
        limit,
      }: { businessId: string; page?: number; limit?: number }
    ) => {
      const filter = { businessId };
      const pageNumber = page && page > 0 ? page : 1;
      const limitNumber = limit && limit > 0 ? limit : 10;
      // Paginate invoices sorted by creation date descending.
      return await (InvoiceModel as any).paginate(filter, {
        page: pageNumber,
        limit: limitNumber,
        sort: { createdAt: -1 },
      });
    },
    invoice: async (_parent: any, { id }: { id: string }) => {
      return InvoiceModel.findById(id);
    },
  },
  Mutation: {
    createInvoice: async (_parent: any, { input }: any) => {
      const { reservationId, businessId, items, total } = input;
      // Compute totals for each item; fallback to price * quantity
      const processedItems = items.map((item: any) => {
        const qty = item.quantity ?? 1;
        const tot = item.total ?? item.price * qty;
        return {
          description: item.description,
          price: item.price,
          quantity: qty,
          total: tot,
        };
      });
      const computedTotal = total ?? processedItems.reduce((sum: number, i: any) => sum + i.total, 0);
      const invoice = new InvoiceModel({
        reservationId,
        businessId,
        items: processedItems,
        total: computedTotal,
      });
      await invoice.save();
      return InvoiceModel.findById(invoice._id);
    },
    updateInvoice: async (_parent: any, { id, input }: any) => {
      const { items, total } = input;
      let processedItems = items;
      if (items) {
        processedItems = items.map((item: any) => {
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
      const computedTotal = total ?? (processedItems ? processedItems.reduce((sum: number, i: any) => sum + i.total, 0) : undefined);
      const update: any = {};
      if (input.reservationId) update.reservationId = input.reservationId;
      if (input.businessId) update.businessId = input.businessId;
      if (processedItems) update.items = processedItems;
      if (computedTotal !== undefined) update.total = computedTotal;
      const invoice = await InvoiceModel.findByIdAndUpdate(id, update, { new: true });
      return invoice;
    },
    deleteInvoice: async (_parent: any, { id }: { id: string }) => {
      await InvoiceModel.findByIdAndDelete(id);
      return true;
    },
    generateInvoicePdf: async (_parent: any, { id }: { id: string }) => {
      const invoice = await InvoiceModel.findById(id);
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      const buffer = await generateInvoicePdfBuffer(invoice);
      return buffer.toString('base64');
    },
  },
  Invoice: {
    // Resolve the reservation field by loading the reservation document
    reservation: async (parent: any) => {
      if (parent.reservationId) {
        return ReservationModel.findById(parent.reservationId);
      }
      return null;
    },
  },
};
