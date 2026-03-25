// ============================================
// PDF Ticket Generator with QR Code
// ============================================
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate a ticket PDF with QR code
 * Returns a Buffer containing the PDF
 */
const generateTicketPDF = async (bookingData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { bookingId, passengerName, busName, busNumber, source, destination,
              seatNumbers, travelDate, totalAmount, departureTime, arrivalTime } = bookingData;

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify({
        bookingId,
        passenger: passengerName,
        bus: busNumber,
        route: `${source} to ${destination}`,
        date: travelDate,
        seats: seatNumbers
      }));

      const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 30 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1a1a2e');

      // Header gradient bar
      doc.rect(0, 0, doc.page.width, 60).fill('#667eea');
      doc.fontSize(24).fillColor('#ffffff').text('🚌 BusGo', 30, 18);
      doc.fontSize(10).text('E-Ticket', doc.page.width - 100, 25);

      // Ticket content
      const y = 80;
      doc.fillColor('#ffffff');

      doc.fontSize(10).fillColor('#aaaaaa').text('TICKET ID', 30, y);
      doc.fontSize(14).fillColor('#667eea').text(bookingId, 30, y + 14);

      doc.fontSize(10).fillColor('#aaaaaa').text('PASSENGER', 30, y + 40);
      doc.fontSize(13).fillColor('#ffffff').text(passengerName, 30, y + 54);

      doc.fontSize(10).fillColor('#aaaaaa').text('BUS', 30, y + 80);
      doc.fontSize(12).fillColor('#ffffff').text(`${busName} (${busNumber})`, 30, y + 94);

      doc.fontSize(10).fillColor('#aaaaaa').text('FROM', 250, y);
      doc.fontSize(14).fillColor('#4ade80').text(source, 250, y + 14);

      doc.fontSize(10).fillColor('#aaaaaa').text('TO', 250, y + 40);
      doc.fontSize(14).fillColor('#4ade80').text(destination, 250, y + 54);

      doc.fontSize(10).fillColor('#aaaaaa').text('DEPARTURE', 250, y + 80);
      doc.fontSize(12).fillColor('#ffffff').text(departureTime || 'N/A', 250, y + 94);

      doc.fontSize(10).fillColor('#aaaaaa').text('DATE', 250, y + 115);
      doc.fontSize(12).fillColor('#ffffff').text(
        new Date(travelDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        250, y + 129
      );

      doc.fontSize(10).fillColor('#aaaaaa').text('SEATS', 30, y + 120);
      doc.fontSize(14).fillColor('#f59e0b').text(seatNumbers.join(', '), 30, y + 134);

      doc.fontSize(10).fillColor('#aaaaaa').text('AMOUNT PAID', 30, y + 160);
      doc.fontSize(18).fillColor('#4ade80').text(`₹${totalAmount}`, 30, y + 174);

      // QR Code
      const qrImg = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      doc.image(Buffer.from(qrImg, 'base64'), doc.page.width - 140, y, { width: 110, height: 110 });
      doc.fontSize(8).fillColor('#aaaaaa').text('Scan to verify', doc.page.width - 135, y + 115);

      // Footer
      doc.fontSize(8).fillColor('#666666').text(
        'This is a computer-generated ticket. Please show this at the time of boarding.',
        30, doc.page.height - 30
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate QR code as base64 string
 */
const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(typeof data === 'string' ? data : JSON.stringify(data));
  } catch (error) {
    console.error('QR generation error:', error);
    return '';
  }
};

module.exports = { generateTicketPDF, generateQRCode };
