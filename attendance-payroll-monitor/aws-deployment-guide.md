# Complete AWS Deployment Guide: AttendPay

Follow this guide step-by-step in your AWS Management Console.

---

## 🏗️ Layer 1: Database & Storage

### 1. DynamoDB Tables
1. Search for **DynamoDB** in the AWS search bar at the top and select it.
2. Click the orange **Create table** button.
3. **Table 1:**
   - Table name: `Employees`
   - Partition key: `employeeId` (Type: String)
   - Scroll to the bottom and click **Create table**.
4. **Table 2:**
   - Click **Create table** again.
   - Table name: `AttendanceRecords`
   - Partition key: `recordId` (Type: String)
   - Click **Create table**.

### 2. S3 Bucket & CORS Policy
1. Search for **S3** in the top search bar and click it.
2. Click **Create bucket**.
3. **Bucket name:** Enter something unique like `attendpay-bucket-yourname`
4. **AWS Region:** Choose `ap-south-1` (Mumbai).
5. **Object Ownership:** ACLs disabled (recommended).
6. **Block Public Access settings:** **Uncheck** "Block all public access" (acknowledge the warning that pops up).
7. Scroll down and click **Create bucket**.
8. **IMPORTANT CORS Setup (Needed for Frontend PDF display):**
   - Click your newly created bucket name.
   - Go to the **Permissions** tab.
   - Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
   - Paste the following exactly:
     ```json
     [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": []
       }
     ]
     ```
   - Click **Save changes**.

> [!IMPORTANT]
> **Update your codebase!** Open `backend/.env` locally and update `S3_BUCKET_NAME` to the exact name of the bucket you just created.

---

## 🔔 Layer 2: Monitoring & Alerts

### 1. SNS Email Alerts
1. Search for **SNS** (Simple Notification Service) and select it.
2. Under "Create topic", enter `HR-Alerts` and click **Next step**.
3. Type: Select **Standard**.
4. Scroll down and click **Create topic**.
5. Once created, click the **Create subscription** button on that page.
6. Protocol: Select **Email**.
7. Endpoint: Enter your personal email address.
8. Click **Create subscription**.
   > *Note: Check your real email inbox! AWS will send you a confirmation link. You **must** click that link to receive alerts.*

### 2. CloudWatch Configuration
1. Search for **CloudWatch** and click it.
2. On the left menu, go to **Alarms** -> **All alarms**, then **Create alarm**.
3. Click **Select metric** -> `AttendancePayrollApp` -> `Environment` -> Select `AttendanceRate`. *(If it's not visible, test the app API locally once first).*
4. **Conditions:**
   - Threshold type: Static
   - Whenever AttendanceRate is: **Lower/Less**
   - Than: `70`
5. **Actions:** Send notification to -> existing SNS topic -> `HR-Alerts`.
6. Name the alarm `Low_Attendance_Trigger` and click **Create**.

---

## 🔐 Layer 3: Hosting & Compute

### 1. Push Code to GitHub
Before touching the EC2 server, push your local code so the server can download it.
Open your terminal in VS Code:
```bash
git init
git add .
git commit -m "Initial AWS deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. IAM Roles
1. Search for **IAM**. On the left, click **Roles** -> **Create role**.
2. Trusted entity type: **AWS service** -> Use case: **EC2** -> Next.
3. Check the boxes for these three policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonS3FullAccess`
   - `CloudWatchFullAccess`
4. Name the role `AttendPay-EC2-Role` -> **Create role**.

### 3. Launching the EC2 Server
1. Search for **EC2** -> **Launch instances**.
2. **Name:** `AttendPay-Main-Server`
3. **OS Image:** Select **Ubuntu** (22.04 LTS).
4. **Instance Type:** `t2.micro`.
5. **Key pair:** Create new key pair, name it `attendpay-key` (.pem). Save it!
6. **Network Settings:** Edit security groups to add Custom Rules for Anywhere (0.0.0.0/0):
   - SSH (Port 22)
   - HTTP (Port 80)
   - Custom TCP (Port 3000 - React Frontend)
   - Custom TCP (Port 5000 - Express Backend)
7. **Advanced Details:** Scroll to *IAM instance profile* and select `AttendPay-EC2-Role`.
8. Click **Launch instance**.

### 4. Git Clone & Setup PM2 on EC2 Server
Connect via SSH terminal (Mac/Linux users run `chmod 400 attendpay-key.pem` first):
```bash
ssh -i "attendpay-key.pem" ubuntu@YOUR-EC2-PUBLIC-IP
```
Run these commands to clone the code and run the deployment script:
```bash
git clone YOUR_GITHUB_REPO_URL attendpay
cd attendpay
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

**CRITICAL Final Server Step — Setup the `.env`:**
The script built the frontend and generated a skeleton `.env` file. You must add your AWS keys:
```bash
nano backend/.env
# Replace the keys! Then save (Ctrl+X, Y, Enter)
pm2 restart attendpay-backend
```

---

## ⚖️ Layer 4: Scaling & Networking (Distribution)

### 1. Elastic IP
1. In EC2 dashboard, click **Elastic IPs** in left menu.
2. Click **Allocate Elastic IP address** -> **Allocate**.
3. Select your IP -> **Actions** -> **Associate Elastic IP address**.
4. Select `AttendPay-Main-Server` and click **Associate**.

### 2. Auto Scaling Group
1. Under **Instances**, click **Launch Templates** -> **Create**.
   - Name: `AttendPay-Template`.
   - AMI: Ubuntu, Type: `t2.micro`, Key pair: `attendpay-key`.
   - Network: Select existing security group (with ports 3000/5000).
   - Save.
2. Under **Auto Scaling**, click **Auto Scaling Groups** -> **Create**.
   - Name: `AttendPay-ASG` using `AttendPay-Template`.
   - Subnets: Select all available availability zones.
   - Group size: Desired `1`, Min `1`, Max `3`.
   - Target tracking policy: Average CPU Utilization at `50%`.

### 3. Application Load Balancer (ELB Health Check included!)
1. Under **Load Balancing**, click **Load Balancers** -> **Create** -> **Application Load Balancer**.
2. Name: `AttendPay-ELB` (Internet-facing, IPv4). Select all Availability Zones.
3. Security Groups: Create/attach a security group that allows HTTP (Port 80) from anywhere.
4. **Listeners and routing:** 
   - Click "Create Target Group".
   - Target type: Instances. Protocol: HTTP, Port: 80.
   - **Health Checks Path:** Change this to `/` (This hits Nginx on your server, proving your instance is healthy).
   - Save Target Group and select it in the Load Balancer.
5. Click **Create Load Balancer**.

You are now running a globally scaled, highly accessible HR platform!
