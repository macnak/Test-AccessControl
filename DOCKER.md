# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Stop and remove database
docker-compose down -v
```

The application will be available at `http://localhost:3000`

### 2. Build and Run with Docker CLI

```bash
# Build the image
docker build -t test-accesscontrol .

# Run the container
docker run -d \
  --name test-accesscontrol \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret-key \
  test-accesscontrol

# View logs
docker logs -f test-accesscontrol

# Stop the container
docker stop test-accesscontrol

# Remove the container
docker rm test-accesscontrol
```

## What Happens on First Start

1. **Container starts** with Node.js 20 Alpine Linux
2. **Database initializes** at `/app/data/shopping.db`
3. **Auto-seeding runs** if database is empty:
   - Creates 150 test users
   - Creates 75 products across 3 categories
   - Creates 20 sample orders
   - Creates 30 payment methods
4. **Expired sessions cleaned**
5. **Server starts** on port 3000

All users have password: `password123`

## Database Persistence

### Volume Mounting

The database persists in the `./data` directory on your host machine:

```yaml
volumes:
  - ./data:/app/data # Host:Container mapping
```

This means:

- ✅ Database survives container restarts
- ✅ Database survives container recreation
- ✅ You can backup `./data` directory
- ✅ You can inspect database directly on host

### Reset Database

```bash
# Stop container
docker-compose down

# Delete database
rm -rf ./data

# Restart (will auto-seed)
docker-compose up -d
```

## Environment Variables

Configure via `docker-compose.yml` or `-e` flags:

| Variable             | Default    | Description              |
| -------------------- | ---------- | ------------------------ |
| `NODE_ENV`           | production | Environment mode         |
| `HOST`               | 0.0.0.0    | Server bind address      |
| `PORT`               | 3000       | Server port              |
| `DB_PATH`            | /app/data  | Database directory       |
| `JWT_SECRET`         | (required) | JWT signing secret       |
| `JWT_REFRESH_SECRET` | (required) | JWT refresh token secret |

**⚠️ Important**: Change JWT secrets in production!

## Testing the Deployment

### Health Check

```bash
# Using curl
curl http://localhost:3000/api/public/health

# Using Docker health check
docker inspect test-accesscontrol | grep -A 10 Health
```

### Export User Credentials for JMeter

```bash
# Option 1: API endpoint
curl http://localhost:3000/api/cookie-session/credentials/export > users.csv

# Option 2: Run command in container
docker-compose exec test-accesscontrol npm run db:export-users
docker cp test-accesscontrol:/app/users-export.csv ./users.csv
```

### Database Statistics

```bash
# Run stats command in container
docker-compose exec test-accesscontrol npm run db:stats
```

Output:

```
Database Statistics:
Users: 150
Products: 75
Active Sessions: 0
Orders: 20
Payment Methods: 30
```

## JMeter Load Testing with Docker

### Setup

1. **Start container**:

   ```bash
   docker-compose up -d
   ```

2. **Export credentials**:

   ```bash
   curl http://localhost:3000/api/cookie-session/credentials/export > users.csv
   ```

3. **Configure JMeter**:
   - Import `users.csv` as CSV Data Set Config
   - Set thread count to 100 (or number of users)
   - Target `http://localhost:3000`

4. **Run test**:
   ```bash
   jmeter -n -t shopping-workflow-test.jmx -l results.jtl
   ```

See [JMETER_GUIDE.md](JMETER_GUIDE.md) for detailed JMeter configuration.

## Container Management

### View Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs test-accesscontrol
```

### Execute Commands in Container

```bash
# Open shell
docker-compose exec test-accesscontrol sh

# Run npm command
docker-compose exec test-accesscontrol npm run db:stats

# Check database
docker-compose exec test-accesscontrol ls -lh /app/data
```

### Restart Container

```bash
# Restart (keeps data)
docker-compose restart

# Recreate (keeps data due to volume)
docker-compose up -d --force-recreate
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Common issues:
# 1. Port 3000 already in use
#    Solution: Change port in docker-compose.yml
#    ports:
#      - "3001:3000"

# 2. Permission issues with volume
#    Solution: Fix ownership
#    sudo chown -R $USER:$USER ./data
```

### Database Issues

```bash
# Check database file
ls -lh ./data/shopping.db

# Reset database
docker-compose down
rm -rf ./data
docker-compose up -d

# Check database from container
docker-compose exec test-accesscontrol sqlite3 /app/data/shopping.db "SELECT COUNT(*) FROM users;"
```

### Performance Issues

```bash
# Check container resources
docker stats test-accesscontrol

# Check database size
docker-compose exec test-accesscontrol du -sh /app/data

# Clean old sessions
docker-compose exec test-accesscontrol npm run db:clean-sessions
```

## Production Deployment

### 1. Update Secrets

Edit `docker-compose.yml`:

```yaml
environment:
  - JWT_SECRET=<generate-strong-random-secret>
  - JWT_REFRESH_SECRET=<generate-different-strong-secret>
```

Generate secrets:

```bash
# Using openssl
openssl rand -base64 32
```

### 2. Configure Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  test-accesscontrol:
    # ... existing config ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 3. Setup Backups

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp -r ./data "$BACKUP_DIR/data_$DATE"
echo "Backup created: $BACKUP_DIR/data_$DATE"

# Keep only last 7 backups
ls -t $BACKUP_DIR | tail -n +8 | xargs -I {} rm -rf "$BACKUP_DIR/{}"
```

Add to crontab:

```bash
# Backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### 4. Setup Monitoring

```yaml
services:
  test-accesscontrol:
    # ... existing config ...
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
```

### 5. Use Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Sharing the Image

### 1. Export Image

```bash
# Save image to tar
docker save test-accesscontrol -o test-accesscontrol.tar

# Compress
gzip test-accesscontrol.tar

# Share test-accesscontrol.tar.gz
```

### 2. Import Image

```bash
# On recipient machine
gunzip test-accesscontrol.tar.gz
docker load -i test-accesscontrol.tar

# Run
docker-compose up -d
```

### 3. Push to Registry (Optional)

```bash
# Tag for Docker Hub
docker tag test-accesscontrol yourusername/test-accesscontrol:latest

# Push
docker push yourusername/test-accesscontrol:latest

# Others can pull
docker pull yourusername/test-accesscontrol:latest
```

## Architecture

```
┌─────────────────────────────────────┐
│         Docker Container            │
│  ┌───────────────────────────────┐  │
│  │   Node.js 20 Alpine           │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Fastify Application    │  │  │
│  │  │  - Controllers          │  │  │
│  │  │  - Middleware           │  │  │
│  │  │  - Routes               │  │  │
│  │  └──────────┬──────────────┘  │  │
│  │             │                 │  │
│  │  ┌──────────▼──────────────┐  │  │
│  │  │  Database Service       │  │  │
│  │  │  - CRUD Operations      │  │  │
│  │  │  - Session Management   │  │  │
│  │  └──────────┬──────────────┘  │  │
│  │             │                 │  │
│  │  ┌──────────▼──────────────┐  │  │
│  │  │  SQLite Database        │  │  │
│  │  │  /app/data/shopping.db  │◄─┼──┼─ Volume Mount
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Port 3000 ◄────────────────────────┼─── Host Port 3000
└─────────────────────────────────────┘

Host Filesystem:
./data/shopping.db ◄─────────────────────── Persisted Database
```

## Summary

- **Simple**: Single command to start: `docker-compose up -d`
- **Persistent**: Database survives container restarts
- **Isolated**: No dependencies on host (except Docker)
- **Portable**: Share image with others easily
- **Ready**: Auto-seeds with 150 users and 75 products
- **Testable**: Export credentials for JMeter load testing

For more information:

- [DATABASE.md](DATABASE.md) - Database schema and management
- [JMETER_GUIDE.md](JMETER_GUIDE.md) - JMeter load testing guide
- [SHOPPING_WORKFLOW.md](SHOPPING_WORKFLOW.md) - API endpoints
