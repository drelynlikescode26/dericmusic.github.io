#!/bin/bash

##############################################################################
# Hero Video Converter
# Converts MOV to MP4 and WebM for mobile web playback
# 
# Usage: bash scripts/convert-hero-video.sh
##############################################################################

set -e  # Exit on error

# Define paths
SOURCE_MOV="assets/hero/glass 8 sec loop.mov"
OUTPUT_MP4="assets/hero/glass 8 sec loop.mp4"
OUTPUT_WEBM="assets/hero/glass 8 sec loop.webm"

echo "=========================================="
echo "Hero Video Converter"
echo "=========================================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo ""
    echo "ERROR: ffmpeg is not installed."
    echo ""
    echo "Install ffmpeg:"
    echo "  - macOS: brew install ffmpeg"
    echo "  - Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  - Windows: Download from https://ffmpeg.org/download.html"
    echo ""
    exit 1
fi

# Check if source file exists
if [ ! -f "$SOURCE_MOV" ]; then
    echo ""
    echo "ERROR: Source file not found: $SOURCE_MOV"
    exit 1
fi

echo ""
echo "Source: $SOURCE_MOV"
echo "Destination: $OUTPUT_MP4 + $OUTPUT_WEBM"
echo ""

# Convert to MP4 (H.264, baseline profile for iPhone compatibility)
echo "[1/2] Converting to MP4 (H.264 baseline, 720p, 30fps)..."
ffmpeg -i "$SOURCE_MOV" \
    -vf "scale=-2:720" \
    -r 30 \
    -c:v libx264 \
    -profile:v baseline \
    -level 3.0 \
    -pix_fmt yuv420p \
    -movflags +faststart \
    -an \
    "$OUTPUT_MP4" \
    -y

echo ""
echo "[2/2] Converting to WebM (VP9, 720p, 30fps)..."
ffmpeg -i "$SOURCE_MOV" \
    -vf "scale=-2:720" \
    -r 30 \
    -c:v libvpx-vp9 \
    -b:v 0 \
    -crf 32 \
    -an \
    "$OUTPUT_WEBM" \
    -y

echo ""
echo "=========================================="
echo "✓ Conversion complete!"
echo "=========================================="
echo ""
echo "Files created:"
echo "  - $OUTPUT_MP4"
echo "  - $OUTPUT_WEBM"
echo ""
echo "Next steps:"
echo "  1. Verify video files exist and play correctly"
echo "  2. Commit: git add assets/hero/*.mp4 assets/hero/*.webm"
echo "  3. Push: git push origin main"
echo ""
