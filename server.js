require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const resend = new Resend(process.env.RESEND_API_KEY);
const workersFilePath = path.join(__dirname, 'data', 'workers.json');

function ensureDataFile() {
  const dir = path.dirname(workersFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(workersFilePath)) {
    fs.writeFileSync(workersFilePath, '[]');
  }
}

function readWorkers() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(workersFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeWorkers(workers) {
  ensureDataFile();
  fs.writeFileSync(workersFilePath, JSON.stringify(workers, null, 2));
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const expected = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64')}`;

  if (authHeader !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="AnyWork Admin"');
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  return next();
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
}));
app.use(express.static(__dirname));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (_req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (_req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/careers', (_req, res) => {
  res.sendFile(path.join(__dirname, 'careers.html'));
});

app.get('/contact', (_req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/privacy', (_req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/terms', (_req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

app.get('/admin', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    service: 'AnyWork email API',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      career: '/api/career/register'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AnyWork email API is running.' });
});

app.get('/api/career/workers', requireAdmin, (_req, res) => {
  const workers = readWorkers();
  return res.status(200).json({ workers });
});

app.put('/api/career/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be one of: pending, approved, rejected.'
    });
  }

  const workers = readWorkers();
  const workerIndex = workers.findIndex((worker) => String(worker.id) === String(id));

  if (workerIndex === -1) {
    return res.status(404).json({
      message: 'Worker not found.'
    });
  }

  workers[workerIndex].status = status;
  workers[workerIndex].updatedAt = new Date().toISOString();
  writeWorkers(workers);

  return res.status(200).json({
    message: 'Worker status updated successfully.',
    worker: workers[workerIndex]
  });
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

app.post('/api/career/register', (req, res) => {
  const { name, email, phone, service, details } = req.body || {};

  if (!name || !email || !phone || !service || !details) {
    return res.status(400).json({
      message: 'Please provide your name, email, phone, service, and experience details.'
    });
  }

  const workers = readWorkers();
  const newEntry = {
    id: Date.now(),
    name,
    email,
    phone,
    service,
    details,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  workers.push(newEntry);
  writeWorkers(workers);

  return res.status(200).json({
    message: 'Registration saved successfully.',
    worker: newEntry
  });
});

app.listen(PORT, () => {
  console.log(`AnyWork email API listening on http://localhost:${PORT}`);
});
