const PDFDocument = require('pdfkit');

const generatePayslip = (employee, workingHours, month) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Header with styling
    doc.rect(0, 0, doc.page.width, 80).fill('#1a237e');
    doc.fillColor('#ffffff')
       .fontSize(24)
       .text('EMPLOYEE PAYSLIP', 50, 25, { align: 'center' });

    doc.fillColor('#000000');
    doc.moveDown(2);

    // Company info
    doc.fontSize(10)
       .fillColor('#666666')
       .text('Attendance & Payroll Monitoring System', { align: 'center' });
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#1a237e');
    doc.moveDown();

    // Employee Details Section
    doc.fontSize(14)
       .fillColor('#1a237e')
       .text('Employee Details');
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor('#333333');
    doc.text(`Month:              ${month}`);
    doc.text(`Employee Name:      ${employee.name}`);
    doc.text(`Department:         ${employee.department}`);
    doc.text(`Employee ID:        ${employee.employeeId}`);
    doc.text(`Join Date:          ${employee.joinDate || 'N/A'}`);
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e0e0e0');
    doc.moveDown();

    // Salary Calculation
    const hourlyRate = employee.salary / 160; // 160 hrs/month
    const earned = (hourlyRate * workingHours).toFixed(2);
    const tax = (earned * 0.1).toFixed(2);
    const pf = (earned * 0.12).toFixed(2);
    const netSalary = (earned - tax - pf).toFixed(2);

    doc.fontSize(14)
       .fillColor('#1a237e')
       .text('Salary Breakdown');
    doc.moveDown(0.5);

    doc.fontSize(11).fillColor('#333333');
    doc.text(`Base Salary (Monthly):    ₹${employee.salary}`);
    doc.text(`Hourly Rate:              ₹${hourlyRate.toFixed(2)}`);
    doc.text(`Working Hours:            ${workingHours} hrs`);
    doc.text(`Gross Earned:             ₹${earned}`);
    doc.moveDown(0.5);

    // Deductions
    doc.fontSize(12).fillColor('#c62828').text('Deductions:');
    doc.fontSize(11).fillColor('#333333');
    doc.text(`  Tax (10%):              ₹${tax}`);
    doc.text(`  Provident Fund (12%):   ₹${pf}`);
    doc.moveDown();

    // Net Salary highlight
    doc.rect(50, doc.y, 500, 35).fill('#e8eaf6');
    doc.fillColor('#1a237e')
       .fontSize(16)
       .text(`  NET SALARY: ₹${netSalary}`, 50, doc.y + 8);

    doc.moveDown(3);

    // Footer
    doc.fontSize(9)
       .fillColor('#999999')
       .text('This is a system-generated payslip. No signature is required.', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

    doc.end();
  });
};

module.exports = { generatePayslip };
