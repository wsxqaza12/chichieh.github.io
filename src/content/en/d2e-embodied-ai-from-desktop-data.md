---
original: d2e
title: 'D2E: Training Embodied AI on Desktop Data'
description: >-
  Can data from people using computers train robots? D2E treats desktop use as a
  cheap, scalable proxy for embodied pretraining, and it's more practical than
  it first sounds.
tags: []
sourceHash: '41af0b43d201'
---

Lately I've been reading a paper called D2E: Scaling Vision-Action Pretraining on Desktop Data for Transfer to Embodied AI, and honestly, I was a bit skeptical at first.
Train on desktop usage data, then use it to control robots? It sounds like one of those conceptually elegant but practically dubious ideas.
But after reading the whole thing, I think the direction is more practical than I expected, and it gets at a question everyone building agents or embodied AI runs into: where does the data actually come from?
D2E's core idea: since "people operating a computer" is already a vision → action process, why not use that kind of data first to train a model's ability to "look at the screen → decide → act"?
And the desktop environment has so many advantages: high resolution, clear state, actions that are discrete and recordable, like mouse and keyboard input, and data that can scale enormously, with almost no shortage.
This work basically treats desktop usage as a low-cost, scalable proxy for embodied pretraining. I recommend checking it out if you're interested, though honestly, what drew me in at first was the game footage 😂
