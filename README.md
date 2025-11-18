# Production Guide

## First Time Setup

```bash
git pull

# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Restart After Update

```bash
# Pull the latest changes
git pull

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Reload the app with PM2
pm2 reload mewa-gamification
```

# stop the app

```bash
pm2 stop mewa-gamification
```

# start the app again

```bash
pm2 start mewa-gamification
```

## Quick Commands

```bash
# View logs
pm2 logs mewa-gamification

# Check status
pm2 status

# Stop
pm2 stop mewa-gamification

# Start
pm2 start ecosystem.config.js
```

## Environment Variables

Set in `ecosystem.config.js`:

```
NEXT_PUBLIC_APP_URL=https://mewa-event.uselines.com
PORT=80
```

**Note:** Port 80 requires root/admin privileges. If it fails, use port 3000 and set up Nginx reverse proxy.

2 main urls:

- https://mewa-event.uselines.com (for users)
- https://mewa-event.uselines.com/live-display (for live display)
- https://mewa-event.uselines.com/giveaway (for giveaway)

## Data Download

- `https://mewa-event.uselines.com/api/download-users` (to download users data as JSON)

## Automatic Backups

The system automatically creates backups of `users.json` whenever it's modified. Backups are saved two directories up from the `data/` folder.

### Backup Location

If your project structure is:

```
project/
  code/
    data/
      users.json
```

Backups are created at:

```
project/
  users.json.backup                (latest backup, always overwritten)
```
