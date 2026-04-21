# AttendPay: Cloud-Based HR & Payroll Management Platform
**Cloud Computing Final Project Report**

## 1. Project Overview
AttendPay is a full-stack, cloud-native Human Resources and Payroll Management platform built to automate and secure core HR workflows. The platform allows administrators to register employees, track daily attendance in real-time, generate automated payroll slips, and receive immediate alerts for workforce anomalies (such as significant drops in attendance). 

Rather than relying on traditional on-premise servers, AttendPay was purpose-built to leverage the full power of Amazon Web Services (AWS) to achieve high availability, fault tolerance, and dynamic scalability.

---

## 2. Application Architecture (The Software Stack)
The application code itself is split into two distinct tiers:

*   **Frontend (User Interface):** Built using **React.js** and **Vite**. It utilizes responsive design principles, modern user interface components, and `Recharts` for rendering dynamic attendance and payroll data dashboards.
*   **Backend (API & Logic):** Built using **Node.js** and **Express.js**. This tier handles all the business logic, including calculating salaries based on attendance, communicating with the MongoDB database and AWS Cloud, and generating PDF payroll slips dynamically.

---

## 3. AWS Cloud Architecture (The Hardware & Infrastructure Stack)
To make AttendPay production-ready, it was deployed across multiple AWS services. Below is a detailed breakdown of how each AWS technology was utilized:

### 3.1. Database & Storage Layer
Traditional SQL databases require manual server maintenance. AttendPay utilizes managed serverless storage to ensure no data is lost during scaling events.
*   **MongoDB Atlas:** A highly scalable NoSQL database and the core of our **MERN stack**. We used MongoDB to store collections for `Employees` and `AttendanceRecords`. Being a cloud-managed service, it ensures our data is globally accessible and highly available.
*   **Amazon S3 (Simple Storage Service):** Whenever HR runs the payroll cycle, the backend generates an official Salary Slip as a PDF. Instead of saving this to the local server (which could be destroyed when scaling down), the PDF is instantly uploaded to an S3 bucket. S3 acts as an infinite, highly durable file storage system, allowing employees to securely download their PDFs via a generated URL.

### 3.2. Monitoring & Alerting Layer
A critical requirement for this HR platform was automated anomaly detection.
*   **Amazon CloudWatch:** We configured the backend to push custom metrics (specifically `AttendanceRate`) to CloudWatch every time attendance is updated. We then created a **CloudWatch Alarm** (`Low_Attendance_Trigger`) that actively monitors this metric.
*   **Amazon SNS (Simple Notification Service):** Connected directly to the CloudWatch alarm. If the `AttendanceRate` metric drops below 70%, CloudWatch triggers the SNS topic (`HR-Alerts`). SNS immediately fires off an automated email to the HR Manager alerting them of the workforce shortage, allowing for rapid management intervention.

### 3.3. Compute & Security Layer
*   **Amazon EC2 (Elastic Compute Cloud):** We provisioned virtual servers running Ubuntu Linux to host our application code. 
*   **IAM Roles (Identity and Access Management):** For security, we did not hardcode long-term AWS access keys into our backend code. Instead, we attached an IAM Role (`AttendPay-EC2-Role`) directly to the EC2 instances. This grants the server "least-privilege" access to interact with CloudWatch and S3 securely.
*   **Security Groups:** Acts as a virtual firewall. We configured rules to block all internet traffic except for Port 80 (HTTP Web Traffic) and Port 22 (Secure SSH for developer maintenance).

### 3.4. Server Management & Routing (Inside EC2)
*   **PM2 (Process Manager):** Installed on the EC2 server to Daemonize (run in the background) the Node.js and React applications. PM2 ensures that if the app crashes, it will automatically restart itself without human intervention.
*   **Nginx (Reverse Proxy):** Operating as a traffic cop. Nginx listens globally on Port 80. If an internet user requests the website, Nginx seamlessly routes them to the React frontend (running internally on Port 3000). If the React frontend makes an API data request (`/api/...`), Nginx instantly routes it to the Express backend (running internally on Port 5000), completely masking the backend ports from the public internet.

### 3.5. High Availability & Scalability Layer (Distribution)
To ensure the platform never goes down during high traffic (e.g., when all employees check in at 9:00 AM simultaneously):
*   **Amazon EC2 Auto Scaling Group (ASG):** We created a "Launch Template" containing our exact server configuration. The ASG monitors the CPU utilization of our server. If the CPU crosses 50%, the ASG automatically spins up identical replica servers in different Availability Zones (data centers) across Mumbai (`ap-south-1`) to handle the load.
*   **Application Load Balancer (ALB):** Since Auto Scaling creates multiple servers with different IP addresses, we placed an ALB in front of them. The ALB acts as a single point of entry for all users (using a static DNS URL). It intelligently distributes incoming traffic evenly across all healthy servers. If one server crashes, the Load Balancer instantly detects the failed health check, stops sending traffic to the broken server, and signals the ASG to build a replacement.

### 3.6. Nginx Configuration Details
To handle incoming production traffic, Nginx was configured as a high-performance reverse proxy. This allows the application to be accessible on the standard web port (80) while shielding the actual Node.js application ports.

```nginx
server {
    listen 80;
    
    # Route frontend requests to React (Port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Route API requests to Express Backend (Port 5000)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 4. Conclusion
By decoupling the storage (S3/MongoDB) from the compute servers (EC2), and placing everything behind an Application Load Balancer and Auto Scaling Group, **AttendPay achieves true High Availability and Fault Tolerance.** 

Even if an entire AWS server goes completely offline, the system will instantly route users to a healthy backup server, ensuring HR and Payroll operations are never interrupted.

---

## 5. Technical Specifications & Data Schema

### 5.1. MongoDB Document Schema
The application utilizes a Mongoose-based data models. The following primary collections were implemented:

| Collection | Key Field | Purpose | Attributes |
| :--- | :--- | :--- | :--- |
| `Employees` | `employeeId` (String) | Stores core staff profiles | `name`, `department`, `salary`, `joinDate` |
| `Attendance` | `recordId` (String) | Stores time-stamped logs | `employeeId`, `type` (checkin/out), `timestamp`, `date` |

### 5.2. CloudWatch Metrics & Logs Strategy
Monitoring is handled via the `cloudwatch.js` service utility, which pushes real-time data to AWS:
1.  **Metric: `AttendanceRate` (Percent)** - Calculated as `(CheckedIn / TotalEmployees) * 100`. This powers our CloudWatch Alarms.
2.  **Metric: `PayrollGenerated` (Count)** - Tracks the total number of salary slips processed.
3.  **Logs:** All system actions (Check-ins, Check-outs, PDF generations) are pushed to **CloudWatch Logs** for auditability and debugging.

---
