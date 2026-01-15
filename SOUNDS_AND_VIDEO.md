# Sound Effects & Background Video Guide

## 🎵 Free Sound Effects (No Attribution Required)

### Quick Download Links

**Option 1: Pixabay (Best - No Attribution)**
- Visit: https://pixabay.com/sound-effects/
- Search terms:
  - "UI click" for pickup/drop sounds
  - "whoosh" for card movements
  - "pop" or "switch" for flip sound
  - "soft click" for hover
- Download as MP3, rename to match our files:
  - `pickup.mp3` (short click/pop sound)
  - `drop.mp3` (soft thud or click)
  - `flip.mp3` (whoosh or switch sound)
  - `hover.mp3` (very subtle click - optional)

**Option 2: Mixkit (Free, No Attribution)**
- Visit: https://mixkit.co/free-sound-effects/click/
- Pre-selected UI sounds ready to download
- Direct links:
  - Click sounds: https://mixkit.co/free-sound-effects/click/
  - Whoosh sounds: https://mixkit.co/free-sound-effects/whoosh/

**Option 3: Zapsplat (Free with Account)**
- Visit: https://www.zapsplat.com/sound-effect-category/user-interface/
- Create free account
- Download UI sounds
- High quality, professional sounds

**Option 4: Freesound (Creative Commons)**
- Visit: https://freesound.org/
- Search for "UI click"
- Filter by "Creative Commons 0" for no attribution needed

---

## 🎬 Background Video Suggestions

### Recommended: Abstract/Gradient Animations

**Best Performance Options** (Small file size, loops seamlessly):

1. **Subtle Gradient Waves** (Recommended)
   - Style: Slow-moving gradient colors
   - Colors: Match your neon palette (pink, purple, blue)
   - Frame rate: 30fps
   - Resolution: 1920x1080
   - File size: ~2-5MB for 10-second loop
   - Source: Pexels, Pixabay, or generate with tools

2. **Particle Field**
   - Style: Floating particles/dots
   - Opacity: Very low (10-20%)
   - Colors: White or matching neon colors
   - Frame rate: 30fps
   - File size: ~3-8MB

3. **Geometric Patterns**
   - Style: Slowly rotating geometric shapes
   - Opacity: 15-25%
   - Colors: Monochrome or duo-tone
   - File size: ~4-10MB

### Where to Find Free Videos

**1. Pixabay Videos (Best - Free, No Attribution)**
- URL: https://pixabay.com/videos/
- Search terms:
  - "abstract gradient"
  - "particles"
  - "geometric motion"
  - "smooth background"
  - "gradient waves"
- Download 1080p MP4 format

**2. Pexels Videos (Free, No Attribution)**
- URL: https://www.pexels.com/videos/
- Search terms:
  - "abstract background"
  - "gradient animation"
  - "soft motion"
- High quality, curated selection

**3. Coverr (Free for Personal & Commercial)**
- URL: https://coverr.co/
- Category: Abstract
- Pre-optimized for web use

**4. Mixkit Videos (Free)**
- URL: https://mixkit.co/free-stock-video/
- Category: Abstract backgrounds
- Ready-to-use clips

### Optimization Tips

**To keep your site fast:**

1. **Compress the video:**
   ```bash
   # Using ffmpeg (install first)
   ffmpeg -i input.mp4 -vcodec h264 -acodec none -b:v 500k output.mp4
   ```

2. **Ideal specifications:**
   - Resolution: 1920x1080 (1080p)
   - Frame rate: 24-30 fps
   - Bitrate: 500-800 kbps
   - Duration: 10-30 seconds (seamless loop)
   - Target file size: 2-10MB max

3. **Use modern formats:**
   - Primary: MP4 (H.264 codec)
   - Fallback: WebM for better compression

### Recommended Videos to Search For

**Style 1: "Soft Gradient Waves"**
- Search: "gradient animation loop"
- Colors: Purple/pink/blue
- Speed: Very slow
- Perfect for: Modern, professional look

**Style 2: "Particle Field"**
- Search: "particles slow motion"
- Density: Low to medium
- Speed: Slow
- Perfect for: Tech/interactive feel

**Style 3: "Geometric Transitions"**
- Search: "geometric abstract motion"
- Complexity: Low to medium
- Speed: Medium-slow
- Perfect for: Creative/design portfolio

**Style 4: "Mesh Gradient"**
- Search: "mesh gradient animation"
- Style: Smooth color transitions
- Speed: Very slow
- Perfect for: Minimal, modern aesthetic

---

## 🚀 Quick Setup

### Sounds (5 minutes)
1. Visit https://pixabay.com/sound-effects/
2. Download 4 short UI sounds
3. Rename them to: pickup.mp3, drop.mp3, flip.mp3, hover.mp3
4. Place in `/public/sounds/` folder
5. Refresh your portfolio - sounds will work!

### Video (10 minutes)
1. Visit https://pixabay.com/videos/
2. Search "gradient abstract" or "particle background"
3. Download 1080p MP4 (5-10MB file)
4. Optimize if needed (see compression tips above)
5. Place in `/public/videos/` folder
6. We'll add the video component next!

---

## Implementation

Once you have your video file, I'll add a BackgroundVideo component that:
- Plays automatically and loops
- Is muted (no audio)
- Has very low opacity (15-20%)
- Sits behind all content
- Doesn't slow down interactions
- Uses hardware acceleration
- Pauses when tab is not visible (saves battery)

Ready to add the video? Let me know when you have the file!
