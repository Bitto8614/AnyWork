require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const resend = new Resend(process.env.RESEND_API_KEY);
const workersFilePath = path.join(__dirname, 'data', 'workers.json');
const contactsFilePath = path.join(__dirname, 'data', 'contacts.json');
const servicesFilePath = path.join(__dirname, 'data', 'services.json');
const uploadsDir = path.join(__dirname, 'uploads', 'photo-ids');

const DEFAULT_SERVICES = [
  { id: 1, slug: 'moving-help', name: 'Moving Help', description: 'We provide reliable moving support for homes, apartments, and motel turnovers, including loading, carrying, and room-to-room setup.', country: 'usa', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80', icon: '', order: 1 },
  { id: 2, slug: 'motel-move-in-support', name: 'Motel Move-In Support', description: 'We provide hotel front desk support, housekeeping help, and room-ready assistance for guests moving in or checking out quickly.', country: 'usa', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80', icon: '', order: 2 },
  { id: 3, slug: 'furniture-setup', name: 'Furniture Setup', description: 'We provide furniture assembly, placement, and room setup for beds, tables, shelves, and essential items in guest rooms or apartments.', country: 'usa', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', icon: '', order: 3 },
  { id: 4, slug: 'plumbing', name: 'Plumbing', description: 'Leak fixes, tap and pipe repairs, and fixture installation from trusted local plumbers.', country: 'india', image: '', icon: '🔧', order: 4 },
  { id: 5, slug: 'electrical-work', name: 'Electrical Work', description: 'Wiring fixes, outlet and light installs, and home electrical safety checks.', country: 'india', image: '', icon: '⚡', order: 5 },
  { id: 6, slug: 'spa-massage', name: 'Spa & Massage', description: 'In-home spa and massage sessions to help you relax and recharge.', country: 'india', image: '', icon: '💆', order: 6 },
  { id: 7, slug: 'haircut-salon', name: 'Haircut & Salon', description: 'Professional haircuts, styling, and grooming brought to your door.', country: 'india', image: '', icon: '💇', order: 7 },
  { id: 8, slug: 'car-cleaning', name: 'Car Cleaning', description: 'Interior and exterior car cleaning at your home, apartment, or office.', country: 'india', image: '', icon: '🚗', order: 8 },
  { id: 9, slug: 'home-cook', name: 'Home Cook', description: 'Home-style cooking help for daily meals, meal prep, or special occasions.', country: 'india', image: '', icon: '👨‍🍳', order: 9 },
  { id: 10, slug: 'home-cleaning', name: 'Home Cleaner', description: 'Full home cleaning, tidying, and deep cleaning for a fresh, organized space.', country: 'india', image: '', icon: '🧹', order: 10 },
  { id: 11, slug: 'bartender-help', name: 'Bartender Help', description: 'Skilled bartenders for house parties, events, and private gatherings.', country: 'india', image: '', icon: '🍸', order: 11 },
  { id: 12, slug: 'nursing', name: 'Nursing', description: 'Qualified nurses for at-home care, injections, wound dressing, and elderly support.', country: 'india', image: '', icon: '🩹', order: 12 },
  { id: 13, slug: 'on-demand-doctors', name: 'On-Demand Doctors', description: 'Licensed doctors available for home visits, consultations, and urgent medical advice.', country: 'india', image: '', icon: '🩺', order: 13 },
  { id: 14, slug: 'driver-help', name: 'Driver Help', description: 'Reliable drivers for vacations, road trips, hospital visits, and everyday errands.', country: 'india', image: '', icon: '🚖', order: 14 }
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function ensureDataFile(filePath) {
  ensureDir(path.dirname(filePath));

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
}

const photoIdUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(uploadsDir);
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Photo ID must be a JPG, PNG, WEBP, or PDF file.'));
    }
  }
});

function readJsonList(filePath) {
  ensureDataFile(filePath);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeJsonList(filePath, list) {
  ensureDataFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
}

function readWorkers() {
  return readJsonList(workersFilePath);
}

function writeWorkers(workers) {
  writeJsonList(workersFilePath, workers);
}

function readContacts() {
  return readJsonList(contactsFilePath);
}

function writeContacts(contacts) {
  writeJsonList(contactsFilePath, contacts);
}

function ensureServicesFile() {
  ensureDir(path.dirname(servicesFilePath));
  if (!fs.existsSync(servicesFilePath)) {
    fs.writeFileSync(servicesFilePath, JSON.stringify(DEFAULT_SERVICES, null, 2));
  }
}

function readServices() {
  ensureServicesFile();
  try {
    const raw = fs.readFileSync(servicesFilePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return DEFAULT_SERVICES;
  }
}

function writeServices(services) {
  ensureServicesFile();
  fs.writeFileSync(servicesFilePath, JSON.stringify(services, null, 2));
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const expected = `Basic ${Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64')}`;

  if (authHeader !== expected) {
    res.setHeader('WWW-Authenticate', 'Basic realm="AnyWork365 Admin"');
    return res.status(401).json({ message: 'Unauthorized access.' });
  }

  return next();
}

async function sendAnyWorkEmail({ to, from, replyTo, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = from || process.env.FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    throw new Error('Email is not configured yet. Add RESEND_API_KEY to your .env file.');
  }

  const result = await resend.emails.send({
    from: `AnyWork365 <${fromEmail}>`,
    to: [to],
    reply_to: replyTo,
    subject,
    html,
  });

  // The Resend SDK does NOT throw on API-level failures (invalid sender,
  // unverified domain, bad recipient, etc). It returns { data, error }.
  // Without this check, every send looked like a "success" even when
  // Resend silently rejected it, which is why emails never arrived.
  if (result?.error) {
    console.error('Resend rejected the email:', JSON.stringify(result.error));
    throw new Error(result.error.message || 'Resend rejected the email.');
  }

  console.log('Resend accepted the email:', JSON.stringify(result?.data));
  return result?.data;
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

// These must be registered BEFORE express.static below, otherwise the static
// middleware serves admin.html directly and the requireAdmin check never runs.
app.get('/admin', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', requireAdmin, (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use(express.static(__dirname, { index: 'index.html', redirect: false }));
app.use('/uploads', requireAdmin, express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (_req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (_req, res) => {
  res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/services/:slug', (req, res) => {
  const { slug } = req.params;
  const filePath = path.join(__dirname, 'services', `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Service page not found.');
  }

  return res.sendFile(filePath);
});

app.get('/services/:slug/', (req, res) => {
  return res.redirect(301, `/services/${req.params.slug}`);
});

app.get('/how-it-works', (_req, res) => {
  res.sendFile(path.join(__dirname, 'how-it-works.html'));
});

app.get('/reviews', (_req, res) => {
  res.sendFile(path.join(__dirname, 'reviews.html'));
});

app.get('/pricing', (_req, res) => {
  res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/careers', (_req, res) => {
  res.sendFile(path.join(__dirname, 'careers.html'));
});

app.get('/areere', (_req, res) => {
  res.sendFile(path.join(__dirname, 'areere.html'));
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

app.get('/api', (_req, res) => {
  res.json({
    ok: true,
    service: 'AnyWork365 email API',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      career: '/api/career/register'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'AnyWork365 email API is running.' });
});

app.get('/api/services', (_req, res) => {
  const services = readServices()
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return res.status(200).json({ services });
});

app.post('/api/admin/services', requireAdmin, (req, res) => {
  const { slug, name, description, country, icon, image, order } = req.body || {};

  if (!slug || !name || !description || !country) {
    return res.status(400).json({ message: 'Please provide slug, name, description, and country.' });
  }

  if (!['usa', 'india'].includes(country)) {
    return res.status(400).json({ message: 'Country must be either "usa" or "india".' });
  }

  const services = readServices();
  if (services.some((service) => service.slug === slug)) {
    return res.status(409).json({ message: 'A service with this slug already exists.' });
  }

  const newService = {
    id: Date.now(),
    slug: String(slug).trim(),
    name: String(name).trim(),
    description: String(description).trim(),
    country,
    icon: icon ? String(icon).trim() : '',
    image: image ? String(image).trim() : '',
    order: Number.isFinite(Number(order)) ? Number(order) : services.length + 1,
    createdAt: new Date().toISOString()
  };

  services.push(newService);
  writeServices(services);

  return res.status(201).json({ message: 'Service added.', service: newService });
});

app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const services = readServices();
  const index = services.findIndex((service) => String(service.id) === String(id));

  if (index === -1) {
    return res.status(404).json({ message: 'Service not found.' });
  }

  const { slug, name, description, country, icon, image, order } = req.body || {};

  if (country && !['usa', 'india'].includes(country)) {
    return res.status(400).json({ message: 'Country must be either "usa" or "india".' });
  }

  services[index] = {
    ...services[index],
    ...(slug !== undefined ? { slug: String(slug).trim() } : {}),
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(description !== undefined ? { description: String(description).trim() } : {}),
    ...(country !== undefined ? { country } : {}),
    ...(icon !== undefined ? { icon: String(icon).trim() } : {}),
    ...(image !== undefined ? { image: String(image).trim() } : {}),
    ...(order !== undefined && Number.isFinite(Number(order)) ? { order: Number(order) } : {}),
    updatedAt: new Date().toISOString()
  };

  writeServices(services);

  return res.status(200).json({ message: 'Service updated.', service: services[index] });
});

app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const services = readServices();
  const nextServices = services.filter((service) => String(service.id) !== String(id));

  if (nextServices.length === services.length) {
    return res.status(404).json({ message: 'Service not found.' });
  }

  writeServices(nextServices);
  return res.status(200).json({ message: 'Service deleted.' });
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

app.delete('/api/career/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const workers = readWorkers();
  const nextWorkers = workers.filter((worker) => String(worker.id) !== String(id));

  if (nextWorkers.length === workers.length) {
    return res.status(404).json({ message: 'Worker not found.' });
  }

  writeWorkers(nextWorkers);
  return res.status(200).json({ message: 'Worker deleted successfully.' });
});

app.get('/api/contact/list', requireAdmin, (_req, res) => {
  const contacts = readContacts();
  return res.status(200).json({ contacts });
});

app.put('/api/contact/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({
      message: 'Status must be one of: new, contacted, closed.'
    });
  }

  const contacts = readContacts();
  const contactIndex = contacts.findIndex((contact) => String(contact.id) === String(id));

  if (contactIndex === -1) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  contacts[contactIndex].status = status;
  contacts[contactIndex].updatedAt = new Date().toISOString();
  writeContacts(contacts);

  return res.status(200).json({
    message: 'Request status updated successfully.',
    contact: contacts[contactIndex]
  });
});

app.delete('/api/contact/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const contacts = readContacts();
  const nextContacts = contacts.filter((contact) => String(contact.id) !== String(id));

  if (nextContacts.length === contacts.length) {
    return res.status(404).json({ message: 'Request not found.' });
  }

  writeContacts(nextContacts);
  return res.status(200).json({ message: 'Request deleted successfully.' });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, hoursNeeded, details } = req.body || {};

  if (!name || !email || !phone || !service || !hoursNeeded || !details) {
    return res.status(400).json({
      message: 'Please provide your name, email, phone, service, hours needed, and project details.'
    });
  }

  const contacts = readContacts();
  const newContact = {
    id: Date.now(),
    name,
    email,
    phone,
    service,
    hoursNeeded,
    details,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeContacts(contacts);

  const toEmail = process.env.TO_EMAIL || 'ajeet.usa013@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const result = await sendAnyWorkEmail({
      to: toEmail,
      from: fromEmail,
      replyTo: email,
      subject: `AnyWork365 Booking Request: ${service}`,
      html: `
        <h2>New booking request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Hours needed:</strong> ${hoursNeeded}</p>
        <p><strong>Details:</strong></p>
        <p>${String(details).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({
      message: 'Request sent successfully.',
      id: result?.id,
      contact: newContact,
    });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({
      message: error.message || 'Email delivery failed. In Resend, the sender domain and the recipient address must be verified before emails can be delivered.',
      error: error.message,
      contact: newContact,
    });
  }
});

app.post('/api/career/register', (req, res, next) => {
  photoIdUpload.single('photoId')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Photo ID upload failed.' });
    }
    return next();
  });
}, async (req, res) => {
  const { name, email, phone, city, service, details, registeringFrom } = req.body || {};

  if (!name || !email || !phone || !city || !service || !details || !registeringFrom) {
    return res.status(400).json({
      message: 'Please provide your name, email, phone, city, service, registration location, and experience details.'
    });
  }

  const workers = readWorkers();
  const newEntry = {
    id: Date.now(),
    name,
    email,
    phone,
    city,
    registeringFrom,
    service,
    details,
    photoId: req.file ? req.file.filename : null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  workers.push(newEntry);
  writeWorkers(workers);

  const toEmail = process.env.TO_EMAIL || 'ajeet.usa013@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const result = await sendAnyWorkEmail({
      to: toEmail,
      from: fromEmail,
      replyTo: email,
      subject: `AnyWork365 New Helper Registration: ${name}`,
      html: `
        <h2>New helper registration</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>City:</strong> ${city}</p>
        <p><strong>Registering from:</strong> ${registeringFrom}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Photo ID submitted:</strong> ${newEntry.photoId ? 'Yes' : 'No'}</p>
        <p><strong>Experience/details:</strong></p>
        <p>${String(details).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({
      message: 'Registration saved successfully and email sent.',
      worker: newEntry,
      emailId: result?.id,
    });
  } catch (error) {
    console.error('Career registration email failed:', error);
    return res.status(200).json({
      message: 'Registration saved successfully, but email delivery is still blocked by Resend verification settings.',
      worker: newEntry,
      warning: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`AnyWork email API listening on http://localhost:${PORT}`);
});
