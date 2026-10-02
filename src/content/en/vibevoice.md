---
original: vibevoice
title: 'VibeVoice: Microsoft''s Open-Source TTS'
description: >-
  Microsoft's open-source VibeVoice targets the weak spots of traditional TTS,
  generating up to 90 minutes of continuous speech with up to four speakers. Why
  that matters for podcasts and audiobooks.
tags: []
sourceHash: 'e15d1bf38cc9'
---

A few days ago Microsoft released VibeVoice, a new open-source TTS technology aimed at solving these problems with traditional TTS:

1. Instability on long text: longer dialogues easily become unstable and lose emotion.
2. Limits on multiple speakers: most models support only 1–2 speakers, which makes complex scenarios like podcasts and scripts hard.
3. Inconsistent voices: it's hard to keep the same character's voice style consistent across different passages.
4. Stiff interaction and transitions: natural dialogue, emotional flow and inserted sound effects are still immature.

According to Microsoft, it can produce continuous speech up to 90 minutes long with up to 4 speakers, which is pretty exciting. It means you could generate a whole podcast episode or a multi-character audiobook from a script, without manual editing. That's much more convenient than stitching together several TTS outputs, where consistency was hard to control.

VibeVoice comes in 7B and 1.5B versions, and you can try the 1.5B one on Colab.

I've posted the architecture and my notes here:
https://reurl.cc/lYX5jE

I've mostly used GPT-SoVITS, ElevenLabs and the like before. If you're interested in TTS/ASR, I'd love to discuss applications together :)
