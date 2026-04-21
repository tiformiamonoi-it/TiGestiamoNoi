// backend/src/app.js
// Configurazione Express app

const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Importa routes
const authRoutes = require('./routes/auth.routes');
const studentsRoutes = require('./routes/students.routes');
const standardPackagesRoutes = require('./routes/standardPackages.routes');
const packagesRoutes = require('./routes/packages.routes');
const paymentsRoutes = require('./routes/payments.routes');
const configRoutes = require('./routes/config.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const lessonRoutes = require('./routes/lessons.routes');
const timeslotsRoutes = require('./routes/timeslots.routes');
const tutorsRoutes = require('./routes/tutors.routes');
const accountingRoutes = require('./routes/accounting.routes');
const bookingRoutes = require('./routes/booking.routes');
const availabilityRoutes = require('./routes/availability.routes');
const closuresRoutes = require('./routes/closures.routes');
const reimbursementsRoutes = require('./routes/reimbursements.routes');

const rateLimit = require('express-rate-limit');

const app = express();

// ============================================
// SECURITY & LIMITS
// ============================================

// Rate limiting specifico per il login (10 tentativi ogni 15 minuti)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Troppi tentativi di login. Riprova tra 15 minuti.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', loginLimiter);

// ✅ CORS per Development + Production
const allowedOrigins = [
  'http://localhost:5173',  // Dev locale
  'https://ti-gestiamo-noi-frontend.vercel.app',  // Production
  process.env.FRONTEND_URL  // Dinamico da env var
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked: ${origin}`);
      callback(new Error('Non autorizzato da CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/standard-packages', standardPackagesRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/timeslots', timeslotsRoutes);
app.use('/api/tutors', tutorsRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/closures', closuresRoutes);
app.use('/api/reimbursements', reimbursementsRoutes);

// ============================================
// ERROR HANDLERS
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
