// backend/src/middleware/errorHandler.js
// Middleware globale per gestione errori

/**
 * Gestione errori centralizzata
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Errore:', err);

  // Errori Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Valore duplicato',
      field: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Risorsa non trovata',
    });
  }

  // Errori validazione express-validator
  if (err.array) {
    return res.status(400).json({
      error: 'Errori di validazione',
      details: err.array(),
    });
  }

  // Errore generico
  res.status(err.status || 500).json({
    error: err.message || 'Errore interno del server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handler per rotte non trovate (404)
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trovato',
    path: req.originalUrl,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
