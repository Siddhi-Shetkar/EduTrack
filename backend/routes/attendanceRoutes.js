const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Route handling
router.post('/mark', attendanceController.markAttendance);
router.get('/', attendanceController.getAttendance);
router.get('/report', attendanceController.getReport);

module.exports = router;
