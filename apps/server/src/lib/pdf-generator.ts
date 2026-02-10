import PDFDocument from 'pdfkit';

interface TicketData {
  bookingId: string;
  listingTitle: string;
  listingLocation: string;
  customerName: string;
  customerEmail: string;
  serviceDate?: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalGuests: number;
  adults: number;
  children: number;
  approvedAt: Date;
}

interface ReceiptData {
  bookingId: string;
  listingTitle: string;
  customerName: string;
  customerEmail: string;
  baseAmount: string;
  tax: string;
  platformFee: string;
  discount?: string;
  totalAmount: string;
  paymentMethod: string;
  transactionId: string;
  paidAt: Date;
  createdAt: Date;
}

export function generateTicketPDF(data: TicketData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const leftMargin = 60;
    const rightMargin = pageWidth - 60;
    const contentWidth = rightMargin - leftMargin;

    // Header Background
    doc.rect(0, 0, pageWidth, 80).fill('#1e40af');

    // Brand Name
    doc.fontSize(24)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('DESHGHURI', leftMargin, 25, { width: contentWidth, align: 'center' });

    doc.fontSize(10)
       .fillColor('#e0e7ff')
       .font('Helvetica')
       .text('Travel Booking Confirmation', leftMargin, 50, { width: contentWidth, align: 'center' });

    doc.fillColor('#000000');

    // Booking ID Section
    let currentY = 110;
    doc.fontSize(11)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('BOOKING ID', leftMargin, currentY);

    doc.fontSize(18)
       .fillColor('#1e40af')
       .font('Helvetica-Bold')
       .text(data.bookingId, leftMargin, currentY + 18);

    // Confirmation Status
    doc.fontSize(10)
       .fillColor('#059669')
       .font('Helvetica-Bold')
       .text('✓ CONFIRMED', rightMargin - 100, currentY + 22, { width: 100, align: 'right' });

    // Divider
    currentY = 165;
    doc.moveTo(leftMargin, currentY).lineTo(rightMargin, currentY).stroke('#e5e7eb');

    // Service Details
    currentY = 185;
    doc.fontSize(14)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(data.listingTitle, leftMargin, currentY, { width: contentWidth });

    currentY += 30;
    doc.fontSize(11)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('📍 ' + data.listingLocation, leftMargin, currentY);

    // Customer & Date Info in Two Columns
    currentY += 40;

    // Left Column - Customer Info
    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('CUSTOMER NAME', leftMargin, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(data.customerName, leftMargin, currentY + 15, { width: 220 });

    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('EMAIL', leftMargin, currentY + 40);

    doc.fontSize(10)
       .fillColor('#111827')
       .font('Helvetica')
       .text(data.customerEmail, leftMargin, currentY + 55, { width: 220 });

    // Right Column - Date Info
    const rightCol = leftMargin + 280;

    if (data.checkInDate && data.checkOutDate) {
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('CHECK-IN', rightCol, currentY);

      doc.fontSize(11)
         .fillColor('#111827')
         .font('Helvetica-Bold')
         .text(formatDate(data.checkInDate), rightCol, currentY + 15);

      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('CHECK-OUT', rightCol, currentY + 40);

      doc.fontSize(11)
         .fillColor('#111827')
         .font('Helvetica-Bold')
         .text(formatDate(data.checkOutDate), rightCol, currentY + 55);
    } else if (data.serviceDate) {
      doc.fontSize(9)
         .fillColor('#6b7280')
         .font('Helvetica')
         .text('SERVICE DATE', rightCol, currentY);

      doc.fontSize(11)
         .fillColor('#111827')
         .font('Helvetica-Bold')
         .text(formatDate(data.serviceDate), rightCol, currentY + 15);
    }

    // Guest Information
    currentY += 95;
    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('GUESTS', leftMargin, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(`${data.totalGuests} Guest${data.totalGuests > 1 ? 's' : ''}`, leftMargin, currentY + 15);

    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(`(${data.adults} Adult${data.adults > 1 ? 's' : ''}, ${data.children} Child${data.children > 1 ? 'ren' : ''})`, leftMargin, currentY + 35);

    // QR Code Placeholder (smaller)
    currentY += 70;
    const qrSize = 80;
    const qrX = leftMargin + (contentWidth - qrSize) / 2;
    doc.rect(qrX, currentY, qrSize, qrSize).lineWidth(1).stroke('#d1d5db');
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .font('Helvetica')
       .text('QR CODE', qrX, currentY + 36, { width: qrSize, align: 'center' });

    // Confirmation Date
    currentY += 100;
    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(`Confirmed on ${formatDate(data.approvedAt)}`, leftMargin, currentY, { width: contentWidth, align: 'center' });

    // Important Notice
    currentY += 30;
    doc.rect(leftMargin, currentY, contentWidth, 60)
       .fillAndStroke('#fef3c7', '#f59e0b')
       .lineWidth(1.5);

    doc.fontSize(10)
       .fillColor('#92400e')
       .font('Helvetica-Bold')
       .text('IMPORTANT', leftMargin + 15, currentY + 12);

    doc.fontSize(9)
       .fillColor('#92400e')
       .font('Helvetica')
       .text('Please present this ticket at the venue for verification.', leftMargin + 15, currentY + 30, { width: contentWidth - 30 });

    // Footer
    currentY += 80;
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .font('Helvetica')
       .text('© 2026 DeshGhuri | support@deshghuri.com', leftMargin, currentY, { width: contentWidth, align: 'center' });

    doc.end();
  });
}

export function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 60, right: 60 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const leftMargin = 60;
    const rightMargin = pageWidth - 60;
    const contentWidth = rightMargin - leftMargin;

    // Header Background
    doc.rect(0, 0, pageWidth, 80).fill('#059669');

    // Receipt Header
    doc.fontSize(24)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text('PAYMENT RECEIPT', leftMargin, 25, { width: contentWidth, align: 'center' });

    doc.fontSize(10)
       .fillColor('#d1fae5')
       .font('Helvetica')
       .text('Official Payment Confirmation', leftMargin, 50, { width: contentWidth, align: 'center' });

    doc.fillColor('#000000');

    // Receipt Number & Date
    let currentY = 110;
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('RECEIPT NO.', leftMargin, currentY);

    doc.fontSize(16)
       .fillColor('#059669')
       .font('Helvetica-Bold')
       .text(data.bookingId, leftMargin, currentY + 18);

    doc.fontSize(9)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(`Date: ${formatDate(data.paidAt)}`, rightMargin - 120, currentY + 22, { width: 120, align: 'right' });

    // Divider
    currentY = 165;
    doc.moveTo(leftMargin, currentY).lineTo(rightMargin, currentY).stroke('#e5e7eb');

    // Customer Information
    currentY = 185;
    doc.fontSize(11)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('RECEIVED FROM', leftMargin, currentY);

    doc.fontSize(13)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(data.customerName, leftMargin, currentY + 20);

    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text(data.customerEmail, leftMargin, currentY + 42);

    // Service Description
    currentY = 260;
    doc.fontSize(11)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('FOR PAYMENT OF', leftMargin, currentY);

    doc.fontSize(12)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(data.listingTitle, leftMargin, currentY + 20, { width: contentWidth });

    // Payment Breakdown Box
    currentY = 325;
    doc.rect(leftMargin, currentY, contentWidth, 160)
       .fillAndStroke('#f9fafb', '#e5e7eb')
       .lineWidth(1);

    const boxPadding = 20;
    const labelX = leftMargin + boxPadding;
    const valueX = rightMargin - boxPadding;

    currentY += 20;

    // Breakdown Items
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('Base Amount', labelX, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica')
       .text(`৳ ${parseFloat(data.baseAmount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX - 100, currentY, { width: 100, align: 'right' });

    currentY += 25;
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('Tax (5%)', labelX, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica')
       .text(`৳ ${parseFloat(data.tax).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX - 100, currentY, { width: 100, align: 'right' });

    currentY += 25;
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('Platform Fee (3%)', labelX, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica')
       .text(`৳ ${parseFloat(data.platformFee).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX - 100, currentY, { width: 100, align: 'right' });

    if (data.discount && parseFloat(data.discount) > 0) {
      currentY += 25;
      doc.fontSize(10)
         .fillColor('#059669')
         .font('Helvetica')
         .text('Discount', labelX, currentY);

      doc.fontSize(11)
         .fillColor('#059669')
         .font('Helvetica')
         .text(`- ৳ ${parseFloat(data.discount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX - 100, currentY, { width: 100, align: 'right' });
    }

    // Total Divider
    currentY += 30;
    doc.moveTo(labelX, currentY).lineTo(valueX, currentY).lineWidth(2).stroke('#059669');

    // Total Amount - LARGE AND CLEAR
    currentY += 15;
    doc.fontSize(11)
       .fillColor('#059669')
       .font('Helvetica-Bold')
       .text('TOTAL AMOUNT PAID', labelX, currentY);

    doc.fontSize(18)
       .fillColor('#059669')
       .font('Helvetica-Bold')
       .text(`৳ ${parseFloat(data.totalAmount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, valueX - 150, currentY - 3, { width: 150, align: 'right' });

    // Payment Details
    currentY = 510;
    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('PAYMENT METHOD', leftMargin, currentY);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica-Bold')
       .text(capitalizePaymentMethod(data.paymentMethod), leftMargin, currentY + 18);

    doc.fontSize(10)
       .fillColor('#6b7280')
       .font('Helvetica')
       .text('TRANSACTION ID', leftMargin, currentY + 48);

    doc.fontSize(11)
       .fillColor('#111827')
       .font('Helvetica')
       .text(data.transactionId, leftMargin, currentY + 66);

    // Verification Stamp
    currentY = 620;
    doc.rect(leftMargin + (contentWidth - 180) / 2, currentY, 180, 60)
       .fillAndStroke('#ecfdf5', '#059669')
       .lineWidth(2);

    doc.fontSize(14)
       .fillColor('#059669')
       .font('Helvetica-Bold')
       .text('✓ PAYMENT VERIFIED', leftMargin, currentY + 15, { width: contentWidth, align: 'center' });

    doc.fontSize(9)
       .fillColor('#047857')
       .font('Helvetica')
       .text('DeshGhuri Marketplace', leftMargin, currentY + 38, { width: contentWidth, align: 'center' });

    // Footer
    currentY = 710;
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .font('Helvetica')
       .text('This is a computer-generated receipt. No signature required.', leftMargin, currentY, { width: contentWidth, align: 'center' });

    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text('For queries: support@deshghuri.com', leftMargin, currentY + 15, { width: contentWidth, align: 'center' });

    doc.end();
  });
}

// Helper function
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function capitalizePaymentMethod(method: string): string {
  if (method === 'bkash') return 'bKash';
  if (method === 'nagad') return 'Nagad';
  if (method === 'bank-transfer') return 'Bank Transfer';
  return method.charAt(0).toUpperCase() + method.slice(1);
}
