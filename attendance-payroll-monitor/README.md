# AttendPay — Attendance & Payroll Monitoring System

> A full-stack cloud-native HR platform built with **React + Node.js + AWS** (DynamoDB, S3, CloudWatch, EC2)

---

## 🏗️ Architecture

```
React Frontend (Port 3000)
       ↕  Vite Proxy
Express Backend (Port 5000)
       ↕
┌──────────────┬─────────────┬──────────────────┐
│  DynamoDB    │   S3        │   CloudWatch     │
│ (Employees + │ (Payslip    │ (Metrics +       │
│  Attendance) │  PDFs)      │  SNS Alerts)     │
└──────────────┴─────────────┴──────────────────┘
       ↕
   EC2 (Ubuntu, PM2) + Auto Scaling Group + ELB
```

---

## 📁 Project Structure

```
attendance-payroll-monitor/
├── backend/
│   ├── server.js
│   ├── routes/         employees.js · attendance.js · payroll.js
│   ├── services/       dynamodb.js · s3.js · cloudwatch.js · pdfGenerator.js
│   ├── middleware/     logger.js
│   └── .env
└── frontend/
    └── src/
        ├── pages/      Dashboard · Employees · Attendance · Payroll · Alerts
        └── components/ Navbar · StatusCard · AttendanceChart
```

---

## 🚀 Local Setup

### 1. Backend

```bash
cd backend
npm install

# Edit .env with your AWS credentials
cp .env .env.example  # keep example clean

npm run dev           # starts on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # starts on port 3000
```

---

## ☁️ AWS Setup

Run `aws-setup.sh` or follow these steps:

| Resource             | Name/Value                     |
|----------------------|--------------------------------|
| DynamoDB Table 1     | `Employees` (PK: employeeId)   |
| DynamoDB Table 2     | `AttendanceRecords` (PK: recordId) |
| S3 Bucket            | `attendance-payroll-bucket`    |
| Region               | `ap-south-1`                   |
| CloudWatch Namespace | `AttendancePayrollApp`         |
| Alert Threshold      | AttendanceRate < 70%           |
| SNS Action           | Email → HR                     |

---

## 🌐 API Reference

### Employees
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/api/employees`      | List all employees    |
| POST   | `/api/employees`      | Add employee          |
| PUT    | `/api/employees/:id`  | Update employee       |
| DELETE | `/api/employees/:id`  | Delete employee       |

### Attendance
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/attendance/checkin`   | Mark check-in            |
| POST   | `/api/attendance/checkout`  | Mark check-out           |
| GET    | `/api/attendance/date/:date`| Records by date          |
| GET    | `/api/attendance/stats/today` | Today's stats + CloudWatch push |

### Payroll
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/payroll/generate/:empId`    | Generate + upload to S3  |
| GET    | `/api/payroll/payslips`           | List S3 payslips         |
| GET    | `/api/payroll/download/:fileName` | Download PDF             |

---

## 🖥️ EC2 Deployment

```bash
# On your EC2 instance (Ubuntu 22.04)
chmod +x deploy-ec2.sh
./deploy-ec2.sh

# Security Group Ports Required:
# 22   (SSH)
# 5000 (Backend API)
# 3000 (React Dev)
# 80   (HTTP via ELB)
```

---

## 💡 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Recharts, Axios     |
| Backend   | Node.js, Express, Morgan, Winston   |
| Database  | AWS DynamoDB (NoSQL)                |
| Storage   | AWS S3 (PDF Payslips)               |
| Monitoring| AWS CloudWatch + SNS                |
| Hosting   | AWS EC2 + Auto Scaling + ELB        |
| PDF       | PDFKit                              |
