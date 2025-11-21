# Database Backup and Restore

This document describes the automated database backup system and restore procedures for the BCFK application.

## Overview

The BCFK application uses SQLite for data persistence. The database is stored in a Docker volume and is automatically backed up daily using GitHub Actions.

## Automated Backups

### Backup Schedule

- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: 30 days (configurable)
- **Storage**: GitHub Actions Artifacts

### Backup Workflow

The backup workflow (`.github/workflows/backup-database.yml`) performs the following steps:

1. Connects to the VPS via SSH
2. Identifies the running BCFK Docker container
3. Copies the database file from the container to the host
4. Downloads the backup to GitHub Actions runner
5. Verifies backup integrity (SQLite format check)
6. Uploads as a GitHub Actions artifact
7. Cleans up old local backups on the VPS (keeps last 7 days)

### Manual Backup Trigger

You can manually trigger a backup at any time:

1. Go to the GitHub repository
2. Navigate to **Actions** → **Backup Database from VPS**
3. Click **Run workflow**
4. Optionally adjust the retention days (default: 30)
5. Click **Run workflow** to start

## Downloading Backups

To download a backup from GitHub:

1. Go to **Actions** → **Backup Database from VPS**
2. Click on a successful workflow run
3. Scroll to **Artifacts** section
4. Download the `bcfk-database-backup-YYYYMMDD_HHMMSS` artifact
5. Extract the `.db` file from the downloaded ZIP

## Restore Procedures

### Prerequisites

- Docker and Docker Compose installed
- Access to the project directory
- The backup file downloaded and extracted

### Local Restore (Development)

Use the provided restore script:

```bash
# From the project root directory
./scripts/restore-backup.sh planning-20250121_020000.db
```

The script will:
1. Verify the backup file integrity
2. Create a safety backup of the current database
3. Stop the Docker container
4. Replace the database in the Docker volume
5. Restart the container

**Warning**: This will replace your current database. The script creates a safety backup before proceeding.

### Manual Restore (Local)

If you prefer to restore manually:

```bash
# 1. Stop the container
docker compose down

# 2. Get the volume name
docker volume ls | grep bcfk

# 3. Copy backup to volume (replace VOLUME_NAME and BACKUP_FILE)
docker run --rm \
  -v VOLUME_NAME:/data \
  -v $(pwd):/backup \
  alpine sh -c "cp /backup/BACKUP_FILE /data/planning.db"

# 4. Start the container
docker compose up -d
```

### VPS Restore (Production)

To restore a backup on the VPS:

```bash
# 1. Download the backup artifact from GitHub Actions
# 2. Upload it to the VPS
scp planning-20250121_020000.db user@vps:/tmp/

# 3. SSH into the VPS
ssh user@vps

# 4. Navigate to the project directory
cd /data/bcfk

# 5. Stop the container
docker compose down

# 6. Get the container and volume info
VOLUME_NAME=$(docker volume ls -q -f name=bcfk)

# 7. Copy backup to volume
docker run --rm \
  -v $VOLUME_NAME:/data \
  -v /tmp:/backup \
  alpine sh -c "cp /backup/planning-20250121_020000.db /data/planning.db && chmod 644 /data/planning.db"

# 8. Start the container
docker compose up -d

# 9. Clean up
rm /tmp/planning-20250121_020000.db
```

## Database Location

### Development
- **Local path**: `./data/planning.db` (on host)
- **Container path**: `/app/data/planning.db`
- **Docker volume**: `bcfk_data`

### Production (VPS)
- **VPS path**: Docker volume managed by Docker Compose
- **Container path**: `/app/data/planning.db`
- **Docker volume**: `bcfk_data` or `bcfk-data`

## Backup Verification

To verify a backup file:

```bash
# Check if it's a valid SQLite database
sqlite3 planning-20250121_020000.db "SELECT count(*) FROM sqlite_master;"

# View tables
sqlite3 planning-20250121_020000.db ".tables"

# Count members
sqlite3 planning-20250121_020000.db "SELECT COUNT(*) FROM members;"

# Count assignments
sqlite3 planning-20250121_020000.db "SELECT COUNT(*) FROM recurring_assignments;"
```

## Troubleshooting

### Backup Workflow Fails

1. Check GitHub Actions logs for specific error messages
2. Verify VPS secrets are correctly configured:
   - `VPS_HOST`
   - `VPS_USERNAME`
   - `VPS_SSH_KEY`
3. Ensure the BCFK container is running on the VPS
4. Check SSH connectivity to the VPS

### Restore Fails

**"Container not found"**
- Check if Docker is running: `docker ps`
- Verify docker-compose.yml exists in current directory

**"Volume not found"**
- List volumes: `docker volume ls`
- The volume should be named `bcfk_data` or similar

**"Permission denied"**
- Ensure the backup file has read permissions: `chmod 644 backup-file.db`

### Database Corruption

If the database becomes corrupted:

1. Download the most recent backup from GitHub Actions
2. Verify backup integrity using sqlite3
3. Follow the restore procedure
4. If corruption persists, check Docker logs: `docker compose logs`

## Best Practices

1. **Regular Testing**: Periodically test the restore process in development
2. **Monitor Backups**: Check GitHub Actions regularly to ensure backups are running
3. **Before Major Changes**: Manually trigger a backup before deploying significant updates
4. **Local Backups**: Keep local copies of important backups outside of GitHub
5. **Documentation**: Update this document if the backup process changes

## Configuration

### Modify Backup Schedule

Edit `.github/workflows/backup-database.yml`:

```yaml
on:
  schedule:
    # Daily at 2 AM UTC
    - cron: '0 2 * * *'
```

Common schedules:
- Every 6 hours: `'0 */6 * * *'`
- Twice daily: `'0 0,12 * * *'`
- Weekly: `'0 2 * * 0'` (Sundays at 2 AM)

### Change Retention Period

The default retention is 30 days. To change:

1. Edit the workflow file
2. Modify the `retention-days` input default value
3. Or specify when manually triggering the workflow

## Emergency Contacts

If you encounter issues with backups:

1. Check GitHub Actions workflow logs
2. Review VPS system logs
3. Contact the repository maintainer

## Appendix: Database Schema

The BCFK database contains the following tables:

- `members` - Association members
- `recurring_assignments` - Weekly recurring assignments
- `specific_assignments` - Specific date assignments
- `absences` - Member absence records
- `audit_logs` - Audit trail of all changes

For detailed schema information, see `database.js`.
