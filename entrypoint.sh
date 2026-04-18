#!/bin/sh

# Load Docker secrets into environment variables at runtime
# This allows the Node.js app to access secrets via process.env without code changes

export DB_USER=$(cat /run/secrets/DB_USER 2>/dev/null || echo "")
export DB_PASSWORD=$(cat /run/secrets/DB_PASSWORD 2>/dev/null || echo "")
export DB_NAME=$(cat /run/secrets/DB_NAME 2>/dev/null || echo "")
export JWT_SECRET=$(cat /run/secrets/JWT_SECRET 2>/dev/null || echo "")
export GMAIL_EMAIL=$(cat /run/secrets/GMAIL_EMAIL 2>/dev/null || echo "")
export SENDGRIND_API_KEY=$(cat /run/secrets/SENDGRIND_API_KEY 2>/dev/null || echo "")
export STRIPE_SECRET_KEY=$(cat /run/secrets/STRIPE_SECRET_KEY 2>/dev/null || echo "")
export REDIS_USER=$(cat /run/secrets/REDIS_USER 2>/dev/null || echo "")
export REDIS_PASSWORD=$(cat /run/secrets/REDIS_PASSWORD 2>/dev/null || echo "")
export AWS_ACCESS_KEY_ID=$(cat /run/secrets/AWS_ACCESS_KEY_ID 2>/dev/null || echo "")
export AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/AWS_SECRET_ACCESS_KEY 2>/dev/null || echo "")

# Execute the original CMD (npm start)
exec "$@"