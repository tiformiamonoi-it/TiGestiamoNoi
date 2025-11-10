// backend/src/routes/tutors.routes.js
const express = require('express');
const router = express.Router();
const { getTutors } = require('../controllers/tutors.controller');
const { protect } = require('../middleware/auth');

//router.use(protect);

// GET /api/tutors - Lista tutor attivi
router.get('/', getTutors);

module.exports = router;
