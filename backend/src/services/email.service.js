// backend/src/services/email.service.js
/**
 * Servizio Email con Nodemailer + SMTP Register.it (securemail.pro)
 */

const nodemailer = require('nodemailer');

// Configurazione SMTP Register.it (usa authsmtp.securemail.pro)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'authsmtp.securemail.pro',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER, // info@tiformiamonoi.it
    pass: process.env.SMTP_PASSWORD
  }
});

// Verifica connessione (opzionale, chiamare in startup)
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ Connessione SMTP verificata');
    return true;
  } catch (error) {
    console.error('❌ Errore connessione SMTP:', error.message);
    return false;
  }
}

/**
 * Invia email per nuova prenotazione
 */
async function sendBookingNotification(booking) {
  const { studentName, studentSurname, studentPhone, requestedDate, subjects, notes } = booking;

  const formattedDate = new Date(requestedDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"Ti Formiamo Noi" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'info@tiformiamonoi.it',
    subject: `📚 Nuova Prenotazione - ${studentName} ${studentSurname}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #5e72e4, #825ee4); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📚 Nuova Prenotazione!</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <strong>👤 Studente:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                ${studentName} ${studentSurname}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <strong>📱 Telefono:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <a href="tel:${studentPhone}">${studentPhone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <strong>📅 Giorno:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                ${formattedDate}
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <strong>📚 Materie:</strong>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                ${subjects.join(', ')}
              </td>
            </tr>
            ${notes ? `
            <tr>
              <td style="padding: 10px 0;">
                <strong>📝 Note:</strong>
              </td>
              <td style="padding: 10px 0;">
                ${notes}
              </td>
            </tr>
            ` : ''}
          </table>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            Data prenotazione: ${new Date().toLocaleString('it-IT')}
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log('📧 Invio email a:', process.env.ADMIN_EMAIL);
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email prenotazione inviata:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Invia email per comunicazione aggiuntiva
 */
async function sendCommunicationNotification(data) {
  const { studentName, studentSurname, studentPhone, requestedDate, notes } = data;

  const formattedDate = new Date(requestedDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"Ti Formiamo Noi" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL || 'info@tiformiamonoi.it',
    subject: `📨 Comunicazione - ${studentName} ${studentSurname}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📨 Nuova Comunicazione</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px;">
          <p><strong>👤 Studente:</strong> ${studentName} ${studentSurname}</p>
          <p><strong>📱 Telefono:</strong> <a href="tel:${studentPhone}">${studentPhone}</a></p>
          <p><strong>📅 Per il giorno:</strong> ${formattedDate}</p>
          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 15px;">
            <p style="margin: 0;"><strong>📝 Messaggio:</strong></p>
            <p style="margin: 10px 0 0 0;">${notes}</p>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            Ricevuto: ${new Date().toLocaleString('it-IT')}
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log('📧 Invio comunicazione a:', process.env.ADMIN_EMAIL);
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email comunicazione inviata:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Errore invio email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  verifyConnection,
  sendBookingNotification,
  sendCommunicationNotification
};
