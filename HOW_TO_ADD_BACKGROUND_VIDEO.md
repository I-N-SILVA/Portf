# 🎥 How to Add Background Video

Your portfolio now has a BackgroundVideo component ready to go! You just need to add a video file.

## Quick Start (2 options)

### Option 1: Automatic Download (Recommended)
```bash
cd /Users/bhujoy/test
./scripts/download-background-video.sh
```

This will download a free abstract particle animation that works perfectly with your neon theme.

### Option 2: Manual Download

1. **Download a free video** from one of these sources:
   - [Pixabay Videos](https://pixabay.com/videos/search/abstract%20particles/) (Free, no attribution)
   - [Pexels Videos](https://www.pexels.com/search/videos/abstract/) (Free, no attribution)
   - [Coverr](https://coverr.co/) (Free background videos)

2. **Save it as**: `public/videos/background.mp4`

3. **Done!** The video will automatically appear in your portfolio.

## What Kind of Video Works Best?

✅ **Good choices:**
- Abstract particles or shapes
- Slow-moving gradients
- Geometric animations
- Nebula/space themes
- Dark-themed animations

❌ **Avoid:**
- Bright or high-contrast videos
- Fast-moving content
- Videos with text or people
- File sizes over 5MB

## Video Settings

The component is already configured with optimal settings:
- **Opacity**: 15% (subtle, not distracting)
- **Blur**: 0px (can be adjusted)
- **Auto-play**: Yes
- **Loop**: Yes
- **Muted**: Yes

### Want to adjust the settings?

Edit `app/page.tsx` line 73:
```tsx
<BackgroundVideo
  src="/videos/background.mp4"
  opacity={0.15}  // 0.1 to 0.3 recommended
  blur={0}        // 0 to 10 pixels
/>
```

## Current Status

The BackgroundVideo component is:
- ✅ Built and ready
- ✅ Imported in app/page.tsx
- ⚠️ Commented out (will be activated after video is added)
- ⚠️ Waiting for video file at: `public/videos/background.mp4`

## Performance Notes

The video component is optimized for performance:
- Hardware-accelerated rendering
- Pauses when tab is hidden (saves battery)
- Sits behind all content (won't interfere)
- Uses native video player (no heavy libraries)

## Troubleshooting

**Video not showing?**
1. Check file exists at `public/videos/background.mp4`
2. Check file format is MP4
3. Try clearing cache and refreshing
4. Check browser console for errors

**Video too distracting?**
- Increase blur: `blur={5}`
- Reduce opacity: `opacity={0.1}`
- Choose a calmer video

**Performance issues?**
- Reduce video file size (compress with HandBrake)
- Lower video resolution to 1080p
- Disable video on mobile (already done automatically)

## Recommended Videos

Here are some specific free videos that work great:

1. **Particle Field** (Dark, Subtle)
   - https://pixabay.com/videos/particles-particle-background-156384/

2. **Abstract Waves** (Smooth, Elegant)
   - https://pixabay.com/videos/wave-abstract-background-motion-31611/

3. **Neon Particles** (Matches your theme!)
   - https://www.pexels.com/video/particles-of-light-2873486/

Just download, rename to `background.mp4`, and place in `public/videos/`!
