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

const app = express();

// ============================================
// MIDDLEWARE GLOBALI
// ============================================
/*
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
*/

// ✅ CORS aggiornato per Development + Production
const allowedOrigins = [
  'http://localhost:5173',  // Dev locale frontend
  'https://ti-gestiamo-noi-frontend.vercel.app',  // Production Vercel
  process.env.FRONTEND_URL  // Dinamico da environment variable
].filter(Boolean);  // Rimuove eventuali undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permette richieste senza origin (Postman, test) o dalla lista allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Non autorizzato da CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ============================================
// ERROR HANDLERS
// ============================================

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
