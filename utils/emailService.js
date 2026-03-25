// ============================================
// Email Service - Free Gmail SMTP via NodeMailer
// ============================================
const { createTransporter } = require('../config/email');

/**
 * Send booking confirmation email to user
 * Uses Gmail SMTP - completely free, no paid API needed
 */
const sendBookingConfirmation = async (bookingData) => {
  try {
    const transporter = createTransporter();

    const { passengerName, passengerEmail, passengerPhone, bookingId, busName, busNumber,
            source, destination, seatNumbers, travelDate, totalAmount, departureTime, passengers } = bookingData;

    // Build passenger rows HTML
    const passengerRows = passengers && passengers.length > 0
      ? passengers.map((p, i) => `
          <tr${i < passengers.length - 1 ? ' style="border-bottom: 1px solid rgba(255,255,255,0.1);"' : ''}>
            <td style="padding: 8px 0; font-size: 13px;">👤 ${p.name || 'N/A'}${p.seat ? ` (Seat: ${p.seat})` : ''}</td>
            <td style="padding: 8px 0; text-align: right; font-size: 13px; opacity: 0.7;">${p.age ? p.age + 'y' : ''}${p.age && p.gender ? ', ' : ''}${p.gender || ''}</td>
          </tr>
        `).join('')
      : `<tr>
            <td style="padding: 8px 0; font-size: 13px;">👤 ${passengerName}</td>
            <td style="padding: 8px 0; text-align: right; font-size: 13px; opacity: 0.7;">${passengerEmail}</td>
          </tr>`;

    const mailOptions = {
      from: `"BusGo Tickets" <${process.env.SMTP_EMAIL}>`,
      to: passengerEmail,
      subject: `🚌 Your Bus Ticket Booking Confirmation - ${bookingId}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🚌 BusGo</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hi <strong>${passengerName}</strong>,</p>
            <p style="opacity: 0.8;">Your bus ticket has been booked successfully! Here are your booking details:</p>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin: 20px 0; backdrop-filter: blur(10px);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Ticket ID</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #667eea;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Bus</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${busName} (${busNumber})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Route</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${source} → ${destination}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Departure</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${departureTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Travel Date</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold;">${new Date(travelDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; opacity: 0.7; font-size: 13px;">Seat(s)</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #4ade80;">${seatNumbers.join(', ')}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.2);">
                  <td style="padding: 12px 0 8px; font-size: 15px; font-weight: bold;">Total Amount</td>
                  <td style="padding: 12px 0 8px; text-align: right; font-size: 20px; font-weight: bold; color: #4ade80;">₹${totalAmount}</td>
                </tr>
              </table>
            </div>

            <!-- Passenger Details -->
            <div style="background: rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid rgba(102,126,234,0.2);">
              <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #667eea;">🧑‍🤝‍🧑 Passenger Details (${passengers && passengers.length > 0 ? passengers.length : 1})</div>
              <table style="width: 100%; border-collapse: collapse;">
                ${passengerRows}
              </table>
              ${passengerPhone ? `<div style="font-size: 12px; opacity: 0.5; margin-top: 10px;">📞 ${passengerPhone}</div>` : ''}
            </div>
            
            <p style="opacity: 0.6; font-size: 12px; margin-top: 20px;">
              Please show this confirmation at the time of boarding. Have a safe journey! 🚌
            </p>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); padding: 15px; text-align: center; font-size: 12px; opacity: 0.5;">
            BusGo - Your Trusted Travel Partner | © 2024
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Booking confirmation email sent to ${passengerEmail}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw - email failure shouldn't block booking
    return false;
  }
};

module.exports = { sendBookingConfirmation };
