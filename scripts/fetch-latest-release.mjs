#!/usr/bin/env node

/**
 * Fetch Latest Release from Spotify
 * 
 * This script fetches the latest release for a Spotify artist and saves it to a JSON file.
 * Uses Spotify Web API with Client Credentials flow.
 * 
 * Environment Variables Required:
 * - SPOTIFY_CLIENT_ID: Your Spotify app client ID
 * - SPOTIFY_CLIENT_SECRET: Your Spotify app client secret
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ARTIST_ID = '08nIFJLOyYWc5eWJCa4S8X';
const MARKET = 'US';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'latestRelease.json');

// Validate environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ Error: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables are required');
  process.exit(1);
}

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getAccessToken() {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    throw error;
  }
}

/**
 * Fetch artist's albums and singles from Spotify
 */
async function fetchArtistReleases(accessToken) {
  const url = `https://api.spotify.com/v1/artists/${ARTIST_ID}/albums?include_groups=album,single&market=${MARKET}&limit=50`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Albums request failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('❌ Failed to fetch artist releases:', error.message);
    throw error;
  }
}

/**
 * Convert release date to sortable format based on precision
 */
function normalizeDateForSorting(releaseDate, precision) {
  if (precision === 'day') {
    return releaseDate; // Already YYYY-MM-DD
  } else if (precision === 'month') {
    return `${releaseDate}-01`; // YYYY-MM -> YYYY-MM-01
  } else if (precision === 'year') {
    return `${releaseDate}-01-01`; // YYYY -> YYYY-01-01
  }
  return releaseDate;
}

/**
 * Find the latest release from the list
 * Prefers newest by date, then singles over albums in case of ties
 */
function findLatestRelease(releases) {
  if (!releases || releases.length === 0) {
    throw new Error('No releases found');
  }

  // Remove duplicates (same name + release_date)
  const uniqueReleases = [];
  const seen = new Set();
  
  for (const release of releases) {
    const key = `${release.name}|${release.release_date}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueReleases.push(release);
    }
  }

  // Sort by date (newest first), then by type (singles first)
  const sorted = uniqueReleases.sort((a, b) => {
    const dateA = normalizeDateForSorting(a.release_date, a.release_date_precision);
    const dateB = normalizeDateForSorting(b.release_date, b.release_date_precision);
    
    // Compare dates (descending)
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    
    // If dates are equal, prefer singles
    if (a.album_type === 'single' && b.album_type !== 'single') {
      return -1;
    }
    if (a.album_type !== 'single' && b.album_type === 'single') {
      return 1;
    }
    
    return 0;
  });

  return sorted[0];
}

/**
 * Get the largest image from Spotify images array
 */
function getLargestImage(images) {
  if (!images || images.length === 0) {
    return '';
  }
  
  // Sort by width descending and pick the first one
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted[0].url;
}

/**
 * Read existing JSON file to preserve manual fields
 */
function readExistingData() {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('⚠️  Could not read existing data file:', error.message);
  }
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log('🎵 Fetching latest release from Spotify...\n');
  
  try {
    // Step 1: Get access token
    console.log('🔑 Getting access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');
    
    // Step 2: Fetch releases
    console.log('📀 Fetching artist releases...');
    const releases = await fetchArtistReleases(accessToken);
    console.log(`✅ Found ${releases.length} releases\n`);
    
    // Step 3: Find latest release
    console.log('🔍 Determining latest release...');
    const latest = findLatestRelease(releases);
    console.log(`✅ Latest release: "${latest.name}" (${latest.release_date})\n`);
    
    // Step 4: Read existing data to preserve manual fields
    const existingData = readExistingData();
    const preservedMoodLine = existingData?.moodLine || '';
    const preservedAppleMusicUrl = existingData?.appleMusicUrl || '';
    const preservedAlbumLink = existingData?.albumLink || '';
    
    // Step 5: Create output data
    const outputData = {
      artistId: ARTIST_ID,
      title: latest.name,
      releaseDate: latest.release_date,
      releaseDatePrecision: latest.release_date_precision,
      coverArt: getLargestImage(latest.images),
      spotifyUrl: latest.external_urls.spotify,
      type: latest.album_type,
      updatedAt: new Date().toISOString(),
      moodLine: preservedMoodLine,
    };
    
    // Add optional fields if they exist
    if (preservedAppleMusicUrl) {
      outputData.appleMusicUrl = preservedAppleMusicUrl;
    }
    if (preservedAlbumLink) {
      outputData.albumLink = preservedAlbumLink;
    }
    
    // Step 6: Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Step 7: Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2) + '\n');
    console.log(`💾 Saved to ${OUTPUT_FILE}`);
    
    // Step 8: Output summary
    console.log('\n📊 Release Details:');
    console.log(`   Title: ${outputData.title}`);
    console.log(`   Type: ${outputData.type}`);
    console.log(`   Release Date: ${outputData.releaseDate} (${outputData.releaseDatePrecision})`);
    console.log(`   Spotify URL: ${outputData.spotifyUrl}`);
    console.log(`   Cover Art: ${outputData.coverArt.substring(0, 50)}...`);
    if (preservedMoodLine) {
      console.log(`   Mood Line: "${preservedMoodLine}" (preserved)`);
    }
    if (preservedAppleMusicUrl) {
      console.log(`   Apple Music URL: "${preservedAppleMusicUrl}" (preserved)`);
    }
    if (preservedAlbumLink) {
      console.log(`   Album Link: "${preservedAlbumLink}" (preserved)`);
    }
    console.log('\n✅ Success!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\n⚠️  The JSON file was NOT updated to prevent data corruption.\n');
    process.exit(1);
  }
}

main();
