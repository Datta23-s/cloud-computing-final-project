const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const { v4: uuidv4 } = require('uuid');

/**
 * Add Employee (MongoDB version)
 */
const addEmployee = async (data) => {
  const employee = new Employee({
    employeeId: uuidv4(),
    name: data.name,
    department: data.department,
    salary: data.salary,
    joinDate: data.joinDate || new Date()
  });
  return await employee.save();
};

/**
 * Get All Employees
 */
const getAllEmployees = async () => {
  return await Employee.find({});
};

/**
 * Get Employee by ID
 */
const getEmployeeById = async (employeeId) => {
  return await Employee.findOne({ employeeId });
};

/**
 * Update Employee
 */
const updateEmployee = async (employeeId, data) => {
  return await Employee.findOneAndUpdate(
    { employeeId },
    { $set: data },
    { new: true }
  );
};

/**
 * Delete Employee
 */
const deleteEmployee = async (employeeId) => {
  await Employee.findOneAndDelete({ employeeId });
  return { employeeId, deleted: true };
};

/**
 * Mark Attendance
 */
const markAttendance = async (employeeId, type) => {
  const record = new Attendance({
    recordId: uuidv4(),
    employeeId,
    type,
    timestamp: new Date(),
    date: new Date().toDateString()
  });
  return await record.save();
};

/**
 * Get Attendance by Date
 */
const getAttendanceByDate = async (date) => {
  return await Attendance.find({ date });
};

/**
 * Get All Attendance Records
 */
const getAllAttendance = async () => {
  return await Attendance.find({});
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  markAttendance,
  getAttendanceByDate,
  getAllAttendance
};
