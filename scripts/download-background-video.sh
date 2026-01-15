#!/bin/bash
# This script downloads a background video for the portfolio.

VIDEO_URL="https://cdn.coverr.co/videos/coverr-blue-and-purple-abstract-background-9315/1080p.mp4"
DOWNLOAD_PATH="/Users/bhujoy/test/public/videos/background.mp4"

echo "Downloading background video..."
curl -L "$VIDEO_URL" -o "$DOWNLOAD_PATH"
echo "Download complete!"