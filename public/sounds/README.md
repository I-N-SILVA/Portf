# Sound effects

**There are no audio files here, and none are needed.**

Every sound in the app is synthesised at runtime by `hooks/useSoundEffects.ts`
using the Web Audio API — oscillators, filtered noise bursts and gain
envelopes, built per sound and thrown away. Nothing is fetched, so there is no
download cost and no missing-file failure mode.

This file used to list four `.mp3` files as "required", with instructions for
sourcing them. They were never added, never referenced, and the code stopped
loading files long before that. The directory is kept only so this note has
somewhere to live.

## Changing a sound

Edit the branch for it in `playSound()`. The types are declared at the top of
the hook:

```
"focus" | "close" | "maximize" | "minimize" | "click" | "shutter" | "hum" | "glitch" | "page"
```

Master gain is set once at the top of `playSound` — change it there rather
than per sound.

## Known gap

There is no mute control and no stored preference. Audio only starts after the
first pointer or key event (browser autoplay policy enforces that, and the hook
waits for it deliberately), but someone who doesn't want UI sound has no way to
say so. See `docs/improvements.md`.
