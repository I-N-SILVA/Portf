# Sound Effects

This directory contains sound effect files for the interactive portfolio.

## Required Files

- `pickup.mp3` - Played when starting to drag a card
- `drop.mp3` - Played when releasing/dropping a card
- `flip.mp3` - Played when flipping a project card
- `hover.mp3` - Played on soft hover interactions (optional)

## Getting Sound Effects

### Option 1: Free Sound Libraries
- **Zapsplat**: https://www.zapsplat.com (free UI sounds)
- **Freesound**: https://freesound.org (creative commons sounds)
- **Mixkit**: https://mixkit.co/free-sound-effects (free without attribution)

### Option 2: Generate with AI
- **ElevenLabs**: Generate custom sound effects
- **Soundraw**: AI sound generation

### Recommendations
- Keep files small (<50kb each) for fast loading
- Use MP3 format for broad compatibility
- Volume should be subtle (will be reduced to 30% in code)
- Suggested search terms:
  - "UI click soft"
  - "UI whoosh"
  - "paper shuffle"
  - "card flip"

## Testing Without Sounds

The portfolio will work without sound files. Missing sounds will be logged as warnings but won't break functionality.

## Current Status

Replace the `.mp3` files in this directory with your chosen sound effects.
