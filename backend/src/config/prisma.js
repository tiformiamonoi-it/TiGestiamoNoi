// backend/src/config/prisma.js
// Client Prisma singleton per connessione database

const { PrismaClient } = require('@prisma/client');

// Crea istanza Prisma Client
// In development, usa globalThis per evitare multiple istanze durante hot-reload
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

module.exports = prisma;
