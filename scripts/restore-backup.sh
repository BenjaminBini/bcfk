#!/bin/bash

# BCFK Database Restore Script
# Usage: ./scripts/restore-backup.sh <backup-file.db>

set -e

BACKUP_FILE="$1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "BCFK Database Restore Script"
echo "========================================="
echo ""

# Check if backup file is provided
if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file not specified${NC}"
  echo "Usage: $0 <backup-file.db>"
  echo ""
  echo "Example:"
  echo "  $0 planning-20250121_020000.db"
  exit 1
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}Error: Backup file '$BACKUP_FILE' not found${NC}"
  exit 1
fi

# Verify it's a valid SQLite database
if command -v sqlite3 &> /dev/null; then
  echo "Verifying backup file integrity..."
  if ! sqlite3 "$BACKUP_FILE" "SELECT count(*) FROM sqlite_master;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Backup file is not a valid SQLite database${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Backup file integrity verified${NC}"
else
  echo -e "${YELLOW}Warning: sqlite3 not found, skipping integrity check${NC}"
fi

# Get file size
FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
echo "Backup file size: $FILE_SIZE bytes"
echo ""

# Confirmation prompt
echo -e "${YELLOW}WARNING: This will replace the current database!${NC}"
echo "Are you sure you want to restore from this backup?"
read -p "Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

echo ""
echo "Starting restore process..."

# Check if we're running locally or on VPS
if [ -f "docker-compose.yml" ]; then
  echo "Detected local environment with docker-compose.yml"

  # Get container ID
  CONTAINER_ID=$(docker ps -q -f name=bcfk-bcfk-1 || docker ps -q -f name=bcfk_bcfk_1)

  if [ -z "$CONTAINER_ID" ]; then
    echo -e "${YELLOW}Container not running. Starting it first...${NC}"
    docker compose up -d
    sleep 3
    CONTAINER_ID=$(docker ps -q -f name=bcfk-bcfk-1 || docker ps -q -f name=bcfk_bcfk_1)
  fi

  if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}Error: Could not find or start BCFK container${NC}"
    exit 1
  fi

  echo "Found container: $CONTAINER_ID"

  # Create backup of current database (just in case)
  CURRENT_BACKUP="planning-before-restore-$(date +'%Y%m%d_%H%M%S').db"
  echo "Creating safety backup of current database..."
  docker cp "$CONTAINER_ID:/app/data/planning.db" "$CURRENT_BACKUP" 2>/dev/null || echo "No existing database to backup"

  # Stop the container
  echo "Stopping container..."
  docker compose down

  # Get the volume name
  VOLUME_NAME=$(docker volume ls -q -f name=bcfk_data || docker volume ls -q -f name=bcfk-data)

  if [ -z "$VOLUME_NAME" ]; then
    echo -e "${RED}Error: Could not find data volume${NC}"
    exit 1
  fi

  echo "Found data volume: $VOLUME_NAME"

  # Copy backup file to volume using a temporary container
  echo "Copying backup to data volume..."
  docker run --rm -v "$VOLUME_NAME:/data" -v "$(pwd):/backup" alpine sh -c "cp /backup/$BACKUP_FILE /data/planning.db && chmod 644 /data/planning.db"

  # Start the container
  echo "Starting container..."
  docker compose up -d

  # Wait for container to be ready
  echo "Waiting for application to start..."
  sleep 3

  echo ""
  echo -e "${GREEN}=========================================${NC}"
  echo -e "${GREEN}Database restore completed successfully!${NC}"
  echo -e "${GREEN}=========================================${NC}"
  echo ""
  echo "Safety backup saved as: $CURRENT_BACKUP"
  echo ""
  echo "You can verify the restore by accessing the application:"
  echo "  http://localhost:3001"
  echo ""

else
  echo -e "${RED}Error: This script should be run from the project root directory${NC}"
  exit 1
fi
