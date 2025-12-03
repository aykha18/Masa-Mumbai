# 🚀 Quick Start: Deploy Machhi to Oracle Cloud Free Tier

## ⚡ Automated Setup (Recommended)

### 1. Launch Oracle Cloud Ubuntu Instance
- **Shape**: VM.Standard.A1.Flex (AMD-based, Free Tier)
- **OCPU**: 4, **Memory**: 24 GB
- **Storage**: 200 GB
- **OS**: Ubuntu 22.04

### 2. Upload Files to Server
```bash
# Upload your project files
scp -r /path/to/machhi ubuntu@<your-instance-ip>:~

# Or clone from GitHub
ssh ubuntu@<your-instance-ip>
git clone https://github.com/yourusername/machhi.git
```

### 3. Run Automated Setup
```bash
# Make script executable and run
chmod +x oracle-cloud-setup.sh
./oracle-cloud-setup.sh
```

### 4. Configure Domain (Optional)
```bash
# Point your domain to the instance IP
# Then run SSL setup
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🎯 Manual Setup Steps

If you prefer manual setup, follow these steps:

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js, PostgreSQL, Nginx
sudo apt install -y postgresql postgresql-contrib nginx nodejs npm

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb machhi_db
sudo -u postgres createuser machhi_user
sudo -u postgres psql -c "ALTER USER machhi_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE machhi_db TO machhi_user;"
```

### 3. Application Setup
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Build frontend
cd frontend && npm run build

# Seed database
cd ../backend
npm run seed
npm run seed-products
```

### 4. Configure Nginx
```nginx
# /etc/nginx/sites-available/machhi
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

### 5. Start Services
```bash
# Start backend
pm2 start backend/index.js --name machhi-backend
pm2 startup && pm2 save

# Start Nginx
sudo systemctl start nginx
```

## 🔧 Environment Configuration

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret
DATABASE_URL=postgresql://machhi_user:password@localhost:5432/machhi_db
UPLOAD_PATH=/var/www/machhi/uploads
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://your-domain.com
```

## 📊 Free Tier Resources Used

| Service | Free Tier Limit | Your Usage |
|---------|----------------|------------|
| Compute VM | 2 VMs (AMD) | 1 VM (4 OCPU, 24 GB) |
| Block Storage | 200 GB | ~50 GB |
| PostgreSQL | Self-managed | Included |
| Load Balancer | 1 instance | Not used |
| Object Storage | 20 GB | For images (optional) |

## 🛡️ Security Checklist

- [ ] Changed default database password
- [ ] Updated JWT secret to random string
- [ ] Configured firewall (UFW)
- [ ] Disabled root SSH login
- [ ] Set up SSL certificate
- [ ] Enabled fail2ban
- [ ] Set up automated backups

## 📈 Scaling Considerations

### When Your App Grows:
1. **Database**: Upgrade to Oracle Autonomous Database
2. **Compute**: Add load balancer and multiple instances
3. **Storage**: Use Object Storage for all file uploads
4. **CDN**: Use Oracle Cloud CDN for static assets

## 🔍 Monitoring Commands

```bash
# Check app status
pm2 status
pm2 logs machhi-backend

# Check web server
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# Check database
sudo -u postgres psql -d machhi_db -c "SELECT COUNT(*) FROM products;"

# Check disk usage
df -h
du -sh /var/www/machhi
```

## 🚨 Common Issues & Fixes

### App not starting:
```bash
cd /var/www/machhi/backend
pm2 delete machhi-backend
pm2 start index.js --name machhi-backend
```

### Nginx errors:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Database connection issues:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql postgresql://machhi_user:password@localhost:5432/machhi_db
```

### SSL issues:
```bash
# Check certificates
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

## 🎉 Success Checklist

- [ ] App accessible at http://your-domain.com
- [ ] Admin login works (admin@fishapp.com / admin123)
- [ ] Products display on landing page
- [ ] User registration works
- [ ] SSL certificate active (HTTPS)
- [ ] Database backups configured
- [ ] Monitoring tools set up

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs machhi-backend`
2. Verify environment variables
3. Test database connectivity
4. Check firewall rules
5. Review Oracle Cloud security lists

Your Machhi fish delivery app is now live on Oracle Cloud Free Tier! 🐟☁️