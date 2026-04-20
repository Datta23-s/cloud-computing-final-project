# 📌 AWS DynamoDB Setup Guide
# Run these AWS CLI commands to create your tables

# ── Step 1: Configure AWS CLI ──────────────────────────────────────────────
aws configure
# Enter: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, region: ap-south-1

# ── Step 2: Create Employees Table ─────────────────────────────────────────
aws dynamodb create-table \
  --table-name Employees \
  --attribute-definitions AttributeName=employeeId,AttributeType=S \
  --key-schema AttributeName=employeeId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# ── Step 3: Create AttendanceRecords Table ──────────────────────────────────
aws dynamodb create-table \
  --table-name AttendanceRecords \
  --attribute-definitions AttributeName=recordId,AttributeType=S \
  --key-schema AttributeName=recordId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# ── Step 4: Verify tables were created ─────────────────────────────────────
aws dynamodb list-tables --region ap-south-1

# ── Step 5: Create S3 Bucket ───────────────────────────────────────────────
aws s3api create-bucket \
  --bucket attendance-payroll-bucket \
  --region ap-south-1 \
  --create-bucket-configuration LocationConstraint=ap-south-1

# ── Step 6: Create CloudWatch Log Group ────────────────────────────────────
aws logs create-log-group \
  --log-group-name /attendance/app-logs \
  --region ap-south-1

# ── Step 7: Create CloudWatch Alarm for Attendance Rate ────────────────────
aws cloudwatch put-metric-alarm \
  --alarm-name "LowAttendanceRate" \
  --alarm-description "Triggers when attendance rate < 70%" \
  --namespace "AttendancePayrollApp" \
  --metric-name "AttendanceRate" \
  --dimensions Name=Environment,Value=production \
  --statistic Average \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 70 \
  --comparison-operator LessThanThreshold \
  --alarm-actions arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HR-Alerts \
  --region ap-south-1

# ── Step 8: Create SNS Topic for HR Alerts ─────────────────────────────────
aws sns create-topic \
  --name HR-Alerts \
  --region ap-south-1

# Subscribe your email to SNS topic (replace ARN and email)
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:YOUR_ACCOUNT_ID:HR-Alerts \
  --protocol email \
  --notification-endpoint hr@yourcompany.com \
  --region ap-south-1
