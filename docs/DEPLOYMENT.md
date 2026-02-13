# VPS Deployment Guide

Complete step-by-step guide to deploy Tasks Generator on your VPS with domain `tasks.yato.foo`.

---

## Prerequisites

- VPS with Ubuntu 22.04+ (or any Linux distro)
- Domain `yato.foo` with DNS access (Porkbun)
- SSH access to your VPS
- Git installed on VPS
- Docker + Docker Compose installed on VPS

---

## Step 1: Point Domain to VPS

**On Porkbun (tasks.yato.foo):**

1. Log in to Porkbun → Go to `yato.foo` domain
2. Click **DNS Records**
3. Add A record:

| Type | Host | Answer | TTL |
|------|------|--------|-----|
| A | `tasks` | `YOUR_VPS_IP` | 600 |

4. Wait 1-5 minutes for DNS propagation

**Verify:**
```bash
# On your local machine
nslookup tasks.yato.foo
# Should return your VPS IP
```

---

## Step 2: Install Docker (if not installed)

**On your VPS:**

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group (avoid sudo)
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
docker-compose --version
```

---

## Step 3: Clone Repository

```bash
# Create apps directory
mkdir -p ~/apps
cd ~/apps

# Clone your repo
git clone https://github.com/honestlyBroke/tasks-generator.git
cd tasks-generator
```

---

## Step 4: Configure Environment

**Create `.env` file:**

```bash
nano .env
```

**Add your API keys:**
```bash
OPENROUTER_API_KEY=your-openrouter-api-key-here
OLLAMA_URL=http://localhost:11434
PORT=3001
NODE_ENV=production
```

Save and exit (`Ctrl+X`, `Y`, `Enter`).

⚠️ **Security:** Make sure `.env` is in `.gitignore` so it's never committed!

---

## Step 5: Build and Run with Docker

```bash
# Build the image
docker-compose build

# Start in background
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify it's running
curl http://localhost:3001/api/health
```

You should see JSON with status checks.

---

## Step 6: Install and Configure Nginx

**Install Nginx:**
```bash
sudo apt install nginx -y
```

**Create nginx config:**
```bash
sudo nano /etc/nginx/sites-available/tasks
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name tasks.yato.foo;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and exit.

**Enable the site:**
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/tasks /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

**Check status:**
```bash
sudo systemctl status nginx
```

**Test HTTP access:**

Open http://tasks.yato.foo in your browser. You should see the app!

---

## Step 7: Install SSL Certificate (HTTPS)

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**Get SSL certificate:**
```bash
sudo certbot --nginx -d tasks.yato.foo
```

Follow prompts:
- Enter email address
- Agree to Terms of Service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

**Certbot will:**
- Generate SSL certificate from Let's Encrypt
- Auto-configure nginx for HTTPS
- Set up auto-renewal

**Verify:**

Open https://tasks.yato.foo — you should see 🔒 in the browser!

**Check auto-renewal:**
```bash
sudo certbot renew --dry-run
```

---

## Step 8 (Optional): Install Ollama

If you want to run local models on your VPS:

**1. Install Ollama:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**2. Pull models:**
```bash
ollama pull llama3.2
ollama pull mistral
```

**3. Verify:**
```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Should show installed models
```

**4. Restart app:**
```bash
cd ~/apps/tasks-generator
docker-compose restart
```

Ollama models will now work in your app!

---

## Step 9: Test Everything

**1. Check DNS:**
```bash
dig tasks.yato.foo
```

**2. Check HTTPS:**
```bash
curl -I https://tasks.yato.foo
# Should return HTTP/1.1 200 OK
```

**3. Test in browser:**

Go to https://tasks.yato.foo and:
- ✅ Home page loads
- ✅ Generate a spec with Template mode
- ✅ Generate with Gemini 2.0 Flash
- ✅ Generate with Ollama (if installed)
- ✅ Check Status page — all green
- ✅ Export to markdown
- ✅ Check History

---

## Maintenance Commands

### View logs
```bash
cd ~/apps/tasks-generator
docker-compose logs -f
```

### Restart app
```bash
docker-compose restart
```

### Update app (pull latest code)
```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### Check disk usage
```bash
df -h
docker system df
```

### Clean up old Docker images
```bash
docker system prune -a
```

### Backup database
```bash
# SQLite database is in data/tasks.db
cp data/tasks.db data/tasks.db.backup-$(date +%Y%m%d)

# Or use a cron job for daily backups
crontab -e
# Add: 0 2 * * * cp ~/apps/tasks-generator/data/tasks.db ~/backups/tasks-$(date +\%Y\%m\%d).db
```

### Monitor resources
```bash
# CPU, RAM, processes
htop

# Docker stats
docker stats
```

---

## Firewall Configuration

**If using UFW:**
```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Check status
sudo ufw status
```

**Important:** Don't block port 22 (SSH) or you'll lose access!

---

## Troubleshooting

### App not accessible at tasks.yato.foo

**Check DNS:**
```bash
dig tasks.yato.foo
# Should show your VPS IP
```

**Check nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Check app is running:**
```bash
docker-compose ps
curl http://localhost:3001
```

---

### SSL certificate fails

**Error:** "DNS problem: NXDOMAIN looking up A for tasks.yato.foo"

**Fix:** Wait for DNS propagation (can take up to 24 hours, usually 5-10 minutes).

**Error:** Port 80 already in use

**Fix:**
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # If Apache is running
```

---

### Docker out of space

**Check disk:**
```bash
df -h
docker system df
```

**Clean up:**
```bash
docker system prune -a
docker volume prune
```

---

### App crashes or 502 error

**Check logs:**
```bash
docker-compose logs -f
```

**Common issues:**
- Database migration failed → Check `data/` directory exists
- Missing .env → Create `.env` with OPENROUTER_API_KEY
- Out of memory → Upgrade VPS or reduce Docker memory limit

---

## Performance Optimization

### Enable Gzip in nginx

Edit `/etc/nginx/nginx.conf`:
```nginx
http {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

Reload: `sudo systemctl reload nginx`

### Set up caching

In `/etc/nginx/sites-available/tasks`, add caching for static assets:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    proxy_pass http://localhost:3001;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Monitor uptime

Use a service like:
- **UptimeRobot** (free, checks every 5 min)
- **BetterUptime** (free tier)

---

## Security Checklist

- [x] HTTPS enabled via Let's Encrypt
- [x] `.env` file in `.gitignore` (API keys not in repo)
- [x] Firewall enabled (UFW)
- [x] Only ports 22, 80, 443 open
- [ ] SSH key-based login (disable password auth)
- [ ] Fail2ban installed (blocks brute force attacks)
- [ ] Regular updates: `sudo apt update && sudo apt upgrade`
- [ ] Database backups scheduled

---

## Final URLs

- **Live app:** https://tasks.yato.foo
- **GitHub:** https://github.com/honestlyBroke/tasks-generator
- **Health check:** https://tasks.yato.foo/api/health

---

## Next Steps

1. ✅ App is live at https://tasks.yato.foo
2. Update [README.md](README.md) line 5 with live URL
3. Commit and push updated models: `git add . && git commit -m "Update models and add deployment guide" && git push`
4. Submit to Aggroso with live link

Good luck! 🚀
