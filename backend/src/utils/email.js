// Email util: supports SendGrid (if SENDGRID_API_KEY) or SMTP via nodemailer
const from = process.env.FROM_EMAIL || `no-reply@${(process.env.FRONTEND_URL||'local').replace(/https?:\/\//,'')}`;

if(process.env.SENDGRID_API_KEY){
  const sg = require('@sendgrid/mail');
  sg.setApiKey(process.env.SENDGRID_API_KEY);
  async function sendMail(to, subject, html, text){
    await sg.send({ to, from, subject, html, text });
  }
  module.exports = { sendMail };
}else{
  const nodemailer = require('nodemailer');
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  let transporter = null;
  if(host && user && pass){
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port,10),
      secure: parseInt(port,10) === 465,
      auth: { user, pass }
    });
  }

  async function sendMail(to, subject, html, text){
    if(transporter){
      return transporter.sendMail({ from, to, subject, html, text });
    }
    // fallback: log to console
    console.log('EMAIL (mock) to:', to);
    console.log('Subject:', subject);
    console.log('Text:', text || html);
    return Promise.resolve();
  }

  module.exports = { sendMail };
}
