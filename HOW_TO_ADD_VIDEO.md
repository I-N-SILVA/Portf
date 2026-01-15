# How to Add Background Video

## Step 1: Get Your Video

Choose one of these options:

### Option A: Quick Pick (Recommended for Testing)
Download one of these pre-selected videos:

1. **Subtle Gradient Waves** (Best match for Considered style)
   - https://pixabay.com/videos/gradient-abstract-motion-colorful-163637/
   - Colors: Purple, pink, blue gradient
   - Size: ~8MB
   - Perfect for your neon aesthetic

2. **Particle Field**
   - https://pixabay.com/videos/particles-abstract-background-86862/
   - Size: ~5MB
   - Clean, minimal look

3. **Smooth Gradient**
   - https://pixabay.com/videos/gradient-background-abstract-152946/
   - Size: ~6MB
   - Professional, modern

### Option B: Browse and Choose
1. Visit https://pixabay.com/videos/search/abstract%20background/
2. Filter by "Free" and "No attribution required"
3. Download 1080p MP4 format
4. Aim for 5-10MB file size

---

## Step 2: Add Video to Your Project

1. Create videos directory (if not exists):
   ```bash
   mkdir public/videos
   ```

2. Move your downloaded video:
   - Rename it to something simple like `background.mp4`
   - Place it in `public/videos/background.mp4`

---

## Step 3: Import and Use the Component

Open `app/page.tsx` and add the BackgroundVideo component:

```typescript
// Add this import at the top with other imports
import BackgroundVideo from "@/components/BackgroundVideo";

// Then in the return statement, add it BEFORE GradientBlobs
return (
  <main className="relative min-h-screen pb-32 lg:cursor-none">
    {/* Custom cursor (desktop only) */}
    <CustomCursor />

    {/* Background Video - ADD THIS */}
    <BackgroundVideo
      src="/videos/background.mp4"
      opacity={0.15}  // 15% opacity - subtle
      blur={0}         // No blur - set to 2-5 for soft focus effect
    />

    {/* Animated background */}
    <GradientBlobs />

    {/* Rest of your content... */}
```

---

## Step 4: Customize (Optional)

Adjust these props to match your preference:

```typescript
<BackgroundVideo
  src="/videos/background.mp4"
  opacity={0.20}   // Increase for more visible video (0.10 - 0.30)
  blur={3}         // Add blur for dreamy effect (0 - 10)
/>
```

**Recommended settings:**
- **Subtle background**: opacity={0.12}, blur={0}
- **Noticeable but not distracting**: opacity={0.20}, blur={2}
- **Prominent feature**: opacity={0.30}, blur={0}

---

## Performance Notes

The BackgroundVideo component is optimized:
- ✅ Uses hardware acceleration
- ✅ Pauses when tab is hidden (saves battery)
- ✅ Doesn't block interactions (pointer-events: none)
- ✅ Loads in background (doesn't slow initial page load)
- ✅ Loops seamlessly
- ✅ No audio track (muted)

**File size recommendations:**
- 2-5MB: Excellent
- 5-10MB: Good
- 10-15MB: Acceptable
- 15MB+: Consider compressing

---

## Troubleshooting

**Video not showing?**
- Check file path is correct: `/public/videos/background.mp4`
- Verify file extension is `.mp4`
- Check browser console for errors
- Try with opacity={0.5} to see if it's just too subtle

**Video is too slow/choppy?**
- Compress the video (see SOUNDS_AND_VIDEO.md for ffmpeg command)
- Reduce resolution to 720p instead of 1080p
- Lower the frame rate to 24fps

**Video is too bright/distracting?**
- Reduce opacity: opacity={0.10}
- Add blur: blur={5}
- Both: opacity={0.15} blur={3}

---

## Example Implementation

Here's the complete code to add to your page.tsx:

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import GradientBlobs from "@/components/GradientBlobs";
import SpatialCanvas, { SpatialCard } from "@/components/SpatialCanvas";
import Navigation from "@/components/Navigation";
import CustomCursor from "@/components/CustomCursor";
import BackgroundVideo from "@/components/BackgroundVideo"; // ADD THIS
// ... rest of imports

export default function Home() {
  // ... your existing state and handlers

  return (
    <main className="relative min-h-screen pb-32 lg:cursor-none">
      <CustomCursor />

      {/* ADD BACKGROUND VIDEO HERE */}
      <BackgroundVideo
        src="/videos/background.mp4"
        opacity={0.15}
      />

      <GradientBlobs />

      {/* Your spatial canvas and cards... */}
    </main>
  );
}
```

---

## Ready-to-Use Video Recommendations

If you want to get started immediately, here are direct download links to videos that work perfectly:

1. **"Abstract Gradient Wave"** (My top pick for your style)
   - Direct: [Download from Pixabay](https://pixabay.com/videos/gradient-abstract-motion-colorful-163637/)
   - Colors match your neon aesthetic perfectly
   - 8MB, seamless loop

2. **"Particle Simulation"**
   - Direct: [Download from Pexels](https://www.pexels.com/video/abstract-digital-particles-3141207/)
   - Tech-forward look
   - 6MB, very smooth

3. **"Soft Bokeh Lights"**
   - Direct: [Download from Pixabay](https://pixabay.com/videos/bokeh-lights-background-abstract-31149/)
   - Elegant, minimal
   - 4MB, great performance

Download any of these, rename to `background.mp4`, place in `public/videos/`, and you're done!
