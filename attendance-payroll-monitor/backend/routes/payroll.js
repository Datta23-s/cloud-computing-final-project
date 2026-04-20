const express = require('express');
const router = express.Router();
const { generatePayslip } = require('../services/pdfGenerator');
const { uploadPDF, listPayslips } = require('../services/s3');
const { getAllEmployees } = require('../services/dynamodb');
const { pushPayrollGenerated, sendLogEvent } = require('../services/cloudwatch');

// Generate payslip for an employee
router.post('/generate/:employeeId', async (req, res) => {
  try {
    const { month, workingHours } = req.body;
    if (!month || !workingHours) {
      return res.status(400).json({ error: 'month and workingHours are required' });
    }

    const employees = await getAllEmployees();
    const employee = employees.find(e => e.employeeId === req.params.employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const pdfBuffer = await generatePayslip(employee, workingHours, month);
    const fileName = `${employee.name.replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.pdf`;
    const url = await uploadPDF(pdfBuffer, fileName);

    // Push metric to CloudWatch
    await pushPayrollGenerated();
    await sendLogEvent({
      action: 'PAYSLIP_GENERATED',
      employeeId: employee.employeeId,
      employeeName: employee.name,
      month,
      workingHours,
      fileName
    });

    res.json({ message: 'Payslip generated successfully', url, fileName });
  } catch (err) {
    console.error('Error generating payslip:', err);
    res.status(500).json({ error: 'Failed to generate payslip' });
  }
});

// List all generated payslips
router.get('/payslips', async (req, res) => {
  try {
    const payslips = await listPayslips();
    res.json(payslips);
  } catch (err) {
    console.error('Error listing payslips:', err);
    res.status(500).json({ error: 'Failed to list payslips' });
  }
});

// Download payslip (returns PDF buffer)
router.get('/download/:fileName', async (req, res) => {
  try {
    const { downloadPDF } = require('../services/s3');
    const buffer = await downloadPDF(req.params.fileName);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.fileName}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Error downloading payslip:', err);
    res.status(500).json({ error: 'Failed to download payslip' });
  }
});

module.exports = router;
