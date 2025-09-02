import { Document as MongooseDoc } from 'mongoose';

type Nullable<T> = T | null | undefined;

interface ClientTheme {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: string;
}

interface ClientLike extends MongooseDoc {
  name?: string;
  contact?: { email?: string; phone?: string; website?: string };
  theme?: ClientTheme;
}

interface ReservationLike {
  _id: any;
  businessType?: string;
  checkIn?: Nullable<string | Date>;
  checkOut?: Nullable<string | Date>;
  date?: Nullable<string | Date>;
  time?: Nullable<string>;
  guests?: Nullable<number>;
  partySize?: Nullable<number>;
  duration?: Nullable<number>;
  totalAmount?: Nullable<number>;
  customerInfo?: { name?: string; email?: string };
}

function formatDate(d?: Nullable<string | Date>): string | null {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

function formatCurrency(amount?: number | null, currency?: string | null): string | null {
  if (amount === null || amount === undefined) return null;
  try {
    const code = (currency || 'USD').toUpperCase();
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
  } catch (_e) {
    return amount.toFixed(2);
  }
}

export function renderReservationConfirmationEmail(
  reservation: ReservationLike,
  options: {
    client?: ClientLike | null;
    cancelLink: string;
    currencyCode?: string | null;
  }
): string {
  const { client, cancelLink, currencyCode } = options;
  const primary = client?.theme?.primaryColor || '#2563eb';
  const secondary = client?.theme?.secondaryColor || '#111827';
  const fontFamily = client?.theme?.typography || 'Arial, sans-serif';
  const name = reservation.customerInfo?.name || 'Guest';
  const businessName = client?.name || 'Your Reservation';
  const total = formatCurrency(reservation.totalAmount ?? null, currencyCode || undefined);
  const checkIn = formatDate(reservation.checkIn);
  const checkOut = formatDate(reservation.checkOut);
  const date = formatDate(reservation.date);

  const detailsRows: string[] = [];
  detailsRows.push(row('Reservation ID', String(reservation._id)));
  if (checkIn) detailsRows.push(row('Check-in', checkIn));
  if (checkOut) detailsRows.push(row('Check-out', checkOut));
  if (reservation.businessType === 'restaurant') {
    if (date) detailsRows.push(row('Date', date));
    if (reservation.time) detailsRows.push(row('Time', reservation.time));
    if (reservation.partySize !== null && reservation.partySize !== undefined) detailsRows.push(row('Party Size', String(reservation.partySize)));
  }
  if (reservation.businessType === 'salon') {
    if (date) detailsRows.push(row('Date', date));
    if (reservation.time) detailsRows.push(row('Time', reservation.time));
    if (reservation.duration !== null && reservation.duration !== undefined) detailsRows.push(row('Duration', `${reservation.duration} minutes`));
  }
  if (reservation.businessType === 'hotel') {
    if (reservation.guests !== null && reservation.guests !== undefined) detailsRows.push(row('Guests', String(reservation.guests)));
  }
  if (total) detailsRows.push(row('Total Amount', total));

  const logoHtml = client?.theme?.logoUrl
    ? `<img src="${client.theme.logoUrl}" alt="${businessName}" style="max-height:40px;display:block;" />`
    : `<div style="font-weight:700;color:#fff;">${businessName}</div>`;

  return `
  <div style="max-width:640px;margin:0 auto;background:#f3f4f6;padding:24px;font-family:${fontFamily};">
    <div style="background:${primary};padding:16px 20px;border-radius:8px 8px 0 0;">
      ${logoHtml}
    </div>
    <div style="background:#ffffff;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:0;">
      <h2 style="margin:0 0 8px 0;color:${secondary};font-size:20px;">Reservation Confirmation</h2>
      <p style="margin:0 0 12px 0;color:#374151;">Hello ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px 0;color:#4b5563;">Thank you for your reservation. Here are your booking details:</p>
      <table role="presentation" width="100%" style="border-collapse:collapse;color:#111827;">
        ${detailsRows.join('\n')}
      </table>
      <div style="text-align:center;margin:20px 0 8px;">
        <a href="${escapeAttr(cancelLink)}" style="display:inline-block;padding:12px 20px;background:${'#ef4444'};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Cancel Reservation</a>
      </div>
      <p style="margin:8px 0 0 0;color:#6b7280;font-size:12px;">If you have any questions, contact us${client?.contact?.email ? ` at <a href="mailto:${escapeAttr(client.contact.email)}" style="color:${primary};text-decoration:none;">${escapeHtml(client.contact.email)}</a>` : ''}.</p>
    </div>
  </div>`;

  function row(label: string, value: string): string {
    return `<tr><td style="padding:6px 0;color:#6b7280;width:160px;">${escapeHtml(label)}:</td><td style=\"padding:6px 0;color:#111827;\">${escapeHtml(value)}<\/td><\/tr>`;
  }

  function escapeHtml(input: string): string {
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function escapeAttr(input: string): string {
    return escapeHtml(input);
  }
}

