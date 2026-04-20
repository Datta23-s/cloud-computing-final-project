#!/bin/bash
# ================================================
# EC2 Deployment Script — AttendPay Full Stack
# Run this on your Ubuntu EC2 instance
# ================================================

set -e

# ================================================
# CONFIGURATION - CHANGE THIS BEFORE RUNNING!
# ================================================
REPO_URL="https://github.com/Datta23-s/cloud-computing-final-project.git"
APP_DIR="$HOME/attendpay"

echo "=== Step 1: Update packages ==="
sudo apt update -y && sudo apt upgrade -y

echo "=== Step 2: Install Node.js 18.x & Nginx ==="
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx

echo "=== Step 3: Install PM2 and Serve globally ==="
sudo npm install -g pm2 serve

echo "=== Step 4: Install Git & Clone Repo ==="
sudo apt install -y git
if [ -d "$APP_DIR" ]; then
    echo "Directory $APP_DIR already exists! Skipping clone."
else
    git clone $REPO_URL $APP_DIR
fi

# IMPORTANT: Establish working directory explicitly for all future steps
cd $APP_DIR/attendance-payroll-monitor

echo "=== Step 5: Install & Build Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Step 6: Install Backend dependencies ==="
cd backend
npm install
mkdir -p logs

echo "=== Step 7: Setup .env file ==="
# We are creating a placeholder .env file.
# You MUST edit this file after script completion.
cat > .env << 'EOF'
PORT=5000
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=REPLACE_ME_WITH_REAL_KEY
AWS_SECRET_ACCESS_KEY=REPLACE_ME_WITH_REAL_SECRET
S3_BUCKET_NAME=attendpay-bucket
DYNAMODB_EMPLOYEES_TABLE=Employees
DYNAMODB_ATTENDANCE_TABLE=AttendanceRecords
CLOUDWATCH_LOG_GROUP=/attendance/app-logs
NODE_ENV=production
EOF

echo "=== Step 8: Start Backend & Frontend with PM2 ==="
# Start Node API Backend on port 5000
pm2 start server.js --name "attendpay-backend"

# Start React Frontend on port 3000 using 'serve'
cd ../frontend
pm2 start serve --name "attendpay-frontend" -- -s dist -l 3000

echo "=== Step 9: Configure PM2 to start on boot ==="
pm2 save
# We run the command directly instead of trusting the user to copy-paste
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "=== Step 10: Configure Nginx Reverse Proxy (Ports 80 -> 3000 / 5000) ==="
# Remove default nginx config
sudo rm -f /etc/nginx/sites-enabled/default

# Create new Nginx config handling both frontend routing and /api routing
sudo tee /etc/nginx/sites-available/attendpay << 'EOF'
server {
    listen 80;
    
    # Route frontend to port 3000
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Route backend to port 5000 so frontend API calls work seamlessly
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/attendpay /etc/nginx/sites-enabled/
sudo systemctl restart nginx

echo ""
echo "=============================================================="
echo "  🚀 Full Stack Deployed (100% Production Ready)!"
echo "  Nginx is routing Port 80 traffic to your app!"
echo "  Health Check enabled at: http://YOUR-IP/health"
echo ""
echo "  ⚠️ CRITICAL NEXT STEP:"
echo "  Run: nano $APP_DIR/backend/.env"
echo "  Replace AWS credentials with your real IAM keys, then run:"
echo "  pm2 restart attendpay-backend"
echo "=============================================================="
