#!/bin/bash
set -e  # stop on first error

# Name of container and image
CONTAINER_NAME="pg"
IMAGE_NAME="ifk"

echo "Removing old container (if exists)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "Building new Docker image..."
docker build -t "$IMAGE_NAME" .

echo "Starting container..."
docker run --env-file .env -dp 3000:5000 --name "$CONTAINER_NAME" "$IMAGE_NAME"

echo "Running at running at http://localhost:5000"

