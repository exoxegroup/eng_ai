#!/bin/bash

# Deployment script for Engineering AI Coach Backend
# This script runs database migrations on Render

echo "Starting deployment script..."

# Navigate to backend directory
cd /opt/render/project/src/backend

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Seed database (optional)
# echo "Seeding database..."
# npx prisma db seed

echo "Deployment completed successfully!"