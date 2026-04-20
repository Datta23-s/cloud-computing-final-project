const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceByDate, getAllAttendance, getAllEmployees } = require('../services/dynamodb');
const { pushAttendanceRate, sendLogEvent } = require('../services/cloudwatch');

// Check-in
router.post('/checkin', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }
    const record = await markAttendance(employeeId, 'checkin');
    await sendLogEvent({ action: 'CHECK_IN', employeeId, timestamp: record.timestamp });
    res.json(record);
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Check-out
router.post('/checkout', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }
    const record = await markAttendance(employeeId, 'checkout');
    await sendLogEvent({ action: 'CHECK_OUT', employeeId, timestamp: record.timestamp });
    res.json(record);
  } catch (err) {
    console.error('Error during check-out:', err);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
  try {
    const records = await getAttendanceByDate(req.params.date);
    res.json(records);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const records = await getAllAttendance();
    res.json(records);
  } catch (err) {
    console.error('Error fetching all attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance stats and push to CloudWatch
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date().toDateString();
    const records = await getAttendanceByDate(today);
    const employees = await getAllEmployees();

    const checkedIn = new Set(records.filter(r => r.type === 'checkin').map(r => r.employeeId));
    const rate = await pushAttendanceRate(employees.length, checkedIn.size);

    res.json({
      date: today,
      totalEmployees: employees.length,
      presentCount: checkedIn.size,
      attendanceRate: rate.toFixed(2) + '%',
      records
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
});

module.exports = router;
