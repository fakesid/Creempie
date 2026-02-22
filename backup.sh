#!/bin/bash

# Create backups folder if it doesn't exist
mkdir -p ~/Desktop/ama-backups

# Create timestamped backup
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE=~/Desktop/ama-backups/ama_backup_$TIMESTAMP.zip

# Exclude node_modules and git from backup
zip -r "$BACKUP_FILE" . \
  -x "node_modules/*" ".git/*" ".DS_Store" "*.log" \
  && echo "✅ Backup created: $BACKUP_FILE" \
  || echo "❌ Backup failed"

# Show latest backups
echo -e "\n📦 Recent backups:"
ls -lh ~/Desktop/ama-backups | tail -5
