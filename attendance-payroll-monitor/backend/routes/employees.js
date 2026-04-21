const express = require('express');
const router = express.Router();
const { addEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../services/dbService');
const { sendLogEvent } = require('../services/cloudwatch');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.json(employees);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Add new employee
router.post('/', async (req, res) => {
  try {
    const { name, department, salary } = req.body;
    if (!name || !department || !salary) {
      return res.status(400).json({ error: 'Name, department, and salary are required' });
    }
    const employee = await addEmployee(req.body);
    await sendLogEvent({ action: 'EMPLOYEE_ADDED', employee });
    res.status(201).json(employee);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateEmployee(req.params.id, req.body);
    await sendLogEvent({ action: 'EMPLOYEE_UPDATED', employeeId: req.params.id });
    res.json(updated);
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteEmployee(req.params.id);
    await sendLogEvent({ action: 'EMPLOYEE_DELETED', employeeId: req.params.id });
    res.json(result);
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
