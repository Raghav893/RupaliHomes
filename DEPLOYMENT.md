# 🚀 RupaliConst Backend — VPS Deployment Guide

Deploy the Spring Boot backend on any Linux VPS (Ubuntu/Debian) using Docker, with Supabase as the hosted PostgreSQL database.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Supabase Setup](#2-supabase-setup)
3. [VPS Setup](#3-vps-setup)
4. [Deploy the Backend](#4-deploy-the-backend)
5. [Verify Deployment](#5-verify-deployment)
6. [Set Up Reverse Proxy (Nginx)](#6-set-up-reverse-proxy-nginx)
7. [SSL with Let's Encrypt](#7-ssl-with-lets-encrypt)
8. [Updating the App](#8-updating-the-app)
9. [Monitoring & Logs](#9-monitoring--logs)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

- A **Linux VPS** (Ubuntu 22.04+ recommended) with at least **1 GB RAM**
- A **domain name** pointed to your VPS IP (e.g., `api.yourdomain.com`)
- A **Supabase** account and project
- SSH access to your VPS

---

## 2. Supabase Setup

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Set a **strong database password** — save it, you'll need it later
4. Choose a region close to your VPS for lowest latency

### 2.2 Get Your Database Connection String

1. Go to **Settings → Database**
2. Scroll to **Connection string** and select **JDBC**
3. Copy the connection string. It looks like:
   ```
   jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres
   ```
4. Note down:
   - **Connection URL** (the JDBC string above)
   - **User**: `postgres`
   - **Password**: the one you set when creating the project

> ⚠️ **Important**: Under **Settings → Database → Connection Pooling**, make sure
> **"Enforce SSL"** mode is set appropriately. If you face SSL issues, you may
> need to append `?sslmode=require` to your JDBC URL.

---

## 3. VPS Setup

SSH into your VPS:

```bash
ssh root@your-vps-ip
```

### 3.1 Update System

```bash
apt update && apt upgrade -y
```

### 3.2 Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to docker group (if not root)
usermod -aG docker $USER

# Verify
docker --version
docker compose version
```

### 3.3 Install Git

```bash
apt install git -y
```

### 3.4 Create a deploy user (recommended, optional)

```bash
adduser deploy
usermod -aG docker deploy
su - deploy
```

---

## 4. Deploy the Backend

### 4.1 Clone the Repository

```bash
cd /opt
git clone https://github.com/your-username/Rupalicons_frontend.git
cd Rupalicons_frontend
```

### 4.2 Create the `.env` File

```bash
cp .env.example .env
nano .env
```

Fill in your real values:

```env
# ── Supabase PostgreSQL ───────────────────────────────────────
SUPABASE_DB_URL=jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-actual-supabase-password

# ── Backend ──────────────────────────────────────────────────
BACKEND_PORT=8080

# ── JWT (generate a strong secret!) ──────────────────────────
JWT_SECRET=your-strong-jwt-secret-here
JWT_EXPIRATION_MS=3600000
```

> 💡 **Generate a strong JWT secret**:
> ```bash
> openssl rand -base64 32
> ```

### 4.3 Build & Start

```bash
docker compose up -d --build
```

This will:
1. Build the Spring Boot app JAR inside Docker (multi-stage build)
2. Start the backend container
3. Auto-connect to your Supabase PostgreSQL
4. Auto-create all tables via JPA `ddl-auto=update`

First build takes **2–5 minutes** (Maven downloads dependencies). Subsequent builds are faster due to Docker layer caching.

---

## 5. Verify Deployment

### 5.1 Check Container Status

```bash
docker compose ps
```

Expected output:
```
NAME             STATUS          PORTS
rupali-backend   Up 2 minutes    0.0.0.0:8080->8080/tcp
```

### 5.2 Check Logs

```bash
docker compose logs -f backend
```

Look for:
```
Started RupaliConstBackendApplication in X.XXX seconds
```

### 5.3 Test the API

```bash
# Health check — should return the Swagger UI or a response
curl http://localhost:8080/swagger-ui/index.html

# Test properties endpoint
curl http://localhost:8080/properties
```

### 5.4 Verify Supabase Tables

Go to **Supabase Dashboard → Table Editor** — you should see tables like `properties`, `users`, `image_model`, etc. created automatically.

---

## 6. Set Up Reverse Proxy (Nginx)

To serve the API on port 80/443 with a domain name:

### 6.1 Install Nginx

```bash
apt install nginx -y
```

### 6.2 Create Nginx Config

```bash
nano /etc/nginx/sites-available/api.yourdomain.com
```

Paste:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Max upload size (for image uploads)
    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 Enable the Site

```bash
ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
nginx -t          # Test config
systemctl reload nginx
```

Your API is now accessible at `http://api.yourdomain.com`.

---

## 7. SSL with Let's Encrypt

### 7.1 Install Certbot

```bash
apt install certbot python3-certbot-nginx -y
```

### 7.2 Get SSL Certificate

```bash
certbot --nginx -d api.yourdomain.com
```

Follow the prompts. Certbot will:
- Obtain the certificate
- Auto-configure Nginx for HTTPS
- Set up auto-renewal

### 7.3 Verify Auto-Renewal

```bash
certbot renew --dry-run
```

Your API is now live at `https://api.yourdomain.com` 🎉

---

## 8. Updating the App

When you push new code:

```bash
cd /opt/Rupalicons_frontend

# Pull latest code
git pull origin main

# Rebuild & restart (zero-downtime isn't possible with single container)
docker compose up -d --build

# Verify
docker compose logs -f backend
```

> 💡 **Tip**: For zero-downtime deployments, consider using Docker Swarm or
> a blue-green deployment strategy.

---

## 9. Monitoring & Logs

### View Logs

```bash
# Follow logs in real-time
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail 100 backend
```

### Container Stats

```bash
# CPU, memory, network usage
docker stats rupali-backend
```

### Restart the Backend

```bash
docker compose restart backend
```

### Stop Everything

```bash
docker compose down
```

---

## 10. Troubleshooting

### Container keeps restarting

```bash
docker compose logs backend
```

Common causes:
- **Wrong DB credentials** → Check `.env` values match Supabase dashboard
- **SSL required** → Append `?sslmode=require` to `SUPABASE_DB_URL`:
  ```
  SUPABASE_DB_URL=jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
  ```

### Cannot connect to Supabase DB

1. Verify your VPS IP is not blocked — Supabase allows all IPs by default
2. Check the connection string format is correct (JDBC format)
3. Test connectivity:
   ```bash
   apt install postgresql-client -y
   psql "postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```

### Port 8080 already in use

```bash
# Find what's using port 8080
lsof -i :8080

# Or change the port in .env
BACKEND_PORT=8081
```

### Out of memory (small VPS)

Add swap space:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Image upload fails (413 error)

Increase Nginx upload limit:
```nginx
client_max_body_size 50M;
```

Then reload: `systemctl reload nginx`

---

## Architecture Overview

```
┌──────────────┐         ┌──────────────────────┐
│   Frontend   │  HTTPS  │      VPS (Docker)     │
│  (Vercel /   │────────▶│  ┌──────────────────┐ │       ┌─────────────┐
│   Netlify)   │         │  │  Spring Boot App  │─┼──────▶│  Supabase   │
│              │◀────────│  │   (port 8080)     │ │ JDBC  │ PostgreSQL  │
└──────────────┘         │  └──────────────────┘ │       └─────────────┘
                         │         ▲              │
                         │    Nginx (80/443)      │
                         └──────────────────────┘
```

---

## Quick Reference

| Command | Description |
|---|---|
| `docker compose up -d --build` | Build & start |
| `docker compose down` | Stop all containers |
| `docker compose logs -f backend` | Follow logs |
| `docker compose restart backend` | Restart backend |
| `docker stats rupali-backend` | Resource usage |
| `docker compose pull && docker compose up -d` | Update images |
