const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Seed admin user
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      console.log('✅ Admin user seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
};

// Database - MongoDB implementation
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
