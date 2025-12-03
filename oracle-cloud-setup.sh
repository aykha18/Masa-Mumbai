#!/bin/bash

# 🚀 Oracle Cloud Free Tier Setup Script for Machhi Fish Delivery App
# Run this script on your fresh Ubuntu instance

set -e

echo "🐟 Setting up Machhi Fish Delivery App on Oracle Cloud Free Tier"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
sudo apt install -y curl wget git htop ufw fail2ban postgresql postgresql-contrib nginx certbot python3-certbot-nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
print_status "Installing PM2..."
sudo npm install -g pm2

# Set up PostgreSQL
print_status "Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
print_status "Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE machhi_db;
CREATE USER machhi_user WITH ENCRYPTED PASSWORD 'machhi_secure_2024!';
GRANT ALL PRIVILEGES ON DATABASE machhi_db TO machhi_user;
ALTER USER machhi_user CREATEDB;
EOF

# Configure PostgreSQL for remote access
print_status "Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/14/main/postgresql.conf

sudo bash -c 'cat >> /etc/postgresql/14/main/pg_hba.conf << EOF
host    machhi_db    machhi_user    10.0.0.0/16    md5
EOF'

sudo systemctl restart postgresql

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/machhi
sudo chown ubuntu:ubuntu /var/www/machhi

# Clone repository (replace with your repo URL)
print_status "Cloning application repository..."
cd /var/www/machhi
# git clone https://github.com/yourusername/machhi.git .
# For now, we'll assume the code is already uploaded

# Install dependencies
print_status "Installing backend dependencies..."
cd backend
npm install

print_status "Installing frontend dependencies..."
cd ../frontend
npm install

# Build frontend
print_status "Building frontend..."
npm run build

# Create uploads directory
print_status "Creating uploads directory..."
sudo mkdir -p /var/www/machhi/uploads
sudo chown ubuntu:ubuntu /var/www/machhi/uploads

# Set up environment files
print_status "Setting up environment files..."

# Backend .env
cat > /var/www/machhi/backend/.env << EOF
NODE_ENV=production
PORT=5000
JWT_SECRET=machhi_jwt_secret_2024_super_secure_key_change_this_in_production
DATABASE_URL=postgresql://machhi_user:machhi_secure_2024!@localhost:5432/machhi_db
UPLOAD_PATH=/var/www/machhi/uploads
EOF

# Frontend .env
cat > /var/www/machhi/frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF

# Set up Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/machhi > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend (React)
    location / {
        root /var/www/machhi/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/machhi/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/machhi /etc/nginx/sites-enabled/ 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Seed database
print_status "Seeding database..."
cd /var/www/machhi/backend
npm run seed
npm run seed-products

# Start backend with PM2
print_status "Starting backend with PM2..."
pm2 start index.js --name "machhi-backend"
pm2 startup
pm2 save

# Set up SSL (optional - requires domain)
print_status "SSL setup reminder: Run 'sudo certbot --nginx -d yourdomain.com' after pointing domain to this server"

# Create backup script
print_status "Creating backup script..."
cat > /var/www/machhi/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p /var/www/backups

# Database backup
pg_dump machhi_db > /var/www/backups/db_backup_$DATE.sql

# Uploads backup
tar -czf /var/www/backups/uploads_$DATE.tar.gz /var/www/machhi/uploads/

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/machhi/backup.sh

# Set up daily backup cron job
print_status "Setting up daily backup..."
(crontab -l ; echo "0 2 * * * /var/www/machhi/backup.sh") | crontab -

print_success "🎉 Machhi Fish Delivery App setup completed!"
print_warning "⚠️  Important next steps:"
echo "1. Update the JWT_SECRET in backend/.env with a secure random string"
echo "2. Change the database password from default"
echo "3. Point your domain to this server's IP address"
echo "4. Run SSL certificate setup: sudo certbot --nginx -d yourdomain.com"
echo "5. Test the application at http://your-server-ip"
echo ""
print_status "Current status:"
pm2 status
sudo systemctl status nginx --no-pager
sudo systemctl status postgresql --no-pager

print_success "Setup complete! Your app should be running at http://your-server-ip"