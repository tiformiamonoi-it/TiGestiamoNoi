// backend/src/server.js
// Entry point del server

require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 3000;

// Avvia server
const server = app.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 Server avviato su http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Database: ${prisma ? 'Connesso' : 'Disconnesso'}`);
  console.log('🚀 ========================================\n');
});

// Gestione graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏸️  SIGTERM ricevuto, chiusura server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server chiuso correttamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n⏸️  SIGINT ricevuto, chiusura server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server chiuso correttamente');
    process.exit(0);
  });
});
