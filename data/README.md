# Watch Portal - Video Management

## Overview
The Watch Portal uses a static JSON file to manage video content. This avoids YouTube API complexity and works perfectly on GitHub Pages.

## Updating Videos

Edit `/data/videos.json` with your YouTube video IDs:

```json
{
  "featured": "YOUR_FEATURED_VIDEO_ID",
  "videos": [
    {
      "id": "VIDEO_ID_1",
      "title": "Video Title 1"
    },
    {
      "id": "VIDEO_ID_2",
      "title": "Video Title 2"
    }
  ]
}
```

## Finding YouTube Video IDs

YouTube URL format:
- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ` (everything after `v=`)

For shortened URLs:
- Short URL: `https://youtu.be/dQw4w9WgXcQ`
- Video ID: `dQw4w9WgXcQ` (everything after `.be/`)

## How It Works

1. **Thumbnails**: Auto-generated from YouTube (`https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg`)
2. **Player**: Only loads iframe when video is selected (lazy loading for performance)
3. **Navigation**: Click thumbnails, use arrow buttons, or swipe on mobile
4. **Close**: X button, ESC key, or click outside video area

## Features

✅ No YouTube API keys required  
✅ No CORS issues  
✅ Works on GitHub Pages  
✅ Lightweight and fast  
✅ Mobile-friendly with swipe gestures  
✅ Cinematic fullscreen design  

## Performance

- Thumbnails load instantly (cached by YouTube CDN)
- Video iframe only loads when selected
- Smooth scrolling thumbnail carousel
- Optimized for mobile with reduced motion support

## Customization

### Add More Videos
Just add more objects to the `videos` array in `videos.json`

### Change Featured Video
Update the `featured` field to a different video ID

### Reorder Videos
Change the order of items in the `videos` array

---

**Important**: After updating `videos.json`, users may need to hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) to see changes due to browser caching.
