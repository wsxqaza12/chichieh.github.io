---
original: jev-lab
title: 'Jev Lab: Deciding What an Agent Should Remember'
description: >-
  A small experiment using Jev to decide whether a candidate memory should be
  kept at all, compared with Luna across 100 synthetic cases, and what filtering
  does to the next answer.
tags: []
sourceHash: '9957b70e8b72'
---

I recently ran a small experiment using Jev on AI memory.

This time the goal wasn't to have it generate more memories for an AI. We mainly wanted to test whether it could help decide if a piece of information should be saved at all.

For example, the source might just say "we're still considering this option, nothing's decided," but the memory about to be saved has somehow turned into "the team has decided to adopt it" 😅. If it's saved without checking, the AI will next time treat something still under discussion as settled.

So this time we had Jev check whether each candidate memory was supported by the source, whether it would be useful later, and whether it had quietly changed the uncertainty in the original. For comparison, we also had Luna run the same 100 synthetic cases.

In this setup, Jev's median decision time was 250 ms, and Luna's was 1,593 ms (including network time). Of the 50 memories worth keeping, Jev kept 39 and Luna kept 41, and neither side was observed accepting anything it shouldn't have.

Honestly, though, what I was more curious about was how this affects the next answer.

So we picked 20 follow-up questions and had the same Luna answer all of them, changing only the memories it could read. Saving every candidate memory led to 10 wrong answers. After filtering by Jev or Luna, there were no wrong answers at all across the 20 questions.

But a cost showed up too. In the Jev group 8 questions, and in the Luna group 10, could have been answered from the source but ended up unanswerable 🫠.

That raises a question well worth more research: blocking wrong memories doesn't mean the correct information was kept. If a candidate memory misreads the source, throwing it away also throws away useful information. I'm wondering whether it could go back, fix the memory and check again, instead of being limited to a binary choice between "save" and "don't save."

This is still a small-scale exploration. The cases and labels were written by AI, so it can't be used as an overall ranking of the models. But I find it pretty interesting, and I wanted to make the experiment public first and see if we can think this through more clearly together.

The details and concrete cases are in Cairn Jev Lab, and the site links to the repo with the full data:
https://lab.cairn.ink/

If you work on AI memory, or have been burned by an AI remembering something wrong, how do you usually handle this? Come share and commiserate in the comments 🙌
