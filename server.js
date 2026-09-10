require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AnyWork email API is running.' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, service, details } = req.body || {};

  if (!name || !email || !service || !details) {
    return res.status(400).json({
      message: 'Please provide your name, email, service, and project details.'
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.TO_EMAIL || 'inaaya26032023@gmail.com';

  if (!apiKey) {
    return res.status(500).json({
      message: 'Email is not configured yet. Add RESEND_API_KEY to your .env file.'
    });
  }

  try {
    const result = await resend.emails.send({
      from: 'AnyWork <onboarding@resend.dev>',
      to: [toEmail],
      reply_to: email,
      subject: `AnyWork Booking Request: ${service}`,
      html: `
        <h2>New booking request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Details:</strong></p>
        <p>${String(details).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({
      message: 'Request sent successfully.',
      id: result?.id,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({
      message: 'Failed to send email.',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AnyWork email API listening on http://localhost:${PORT}`);
});
