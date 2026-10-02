---
original: ai寫的程式碼你會全部檢查嗎
title: Do You Review All the Code AI Writes?
description: >-
  Some people read every line of AI-written code, some read none. My middle
  path, deciding review depth by risk and keeping everything behind branches and
  PRs, and why I stopped skipping reviews.
tags: []
sourceHash: '373c534942fc'
---

I've been talking with people recently about using AI to help with development, and it turns out people's approaches to vibe coding vary wildly. Some insist on reading every line, some don't look at all, and I'm somewhere in the middle 🤣

Here's what I do right now:
1. Git branches + PRs: code from vibe coding always goes on a branch first. Every feature gets a commit, and it ends with a PR. Nothing goes straight into main.

2. Deciding review depth case by case:
• Security-related (login, permissions): always reviewed by hand, sometimes rewritten.
• Simple features or repetitive logic: a quick scan, and if nothing obvious is wrong, it passes.
• Complex or core logic: let the AI write it first, but I may restructure the architecture to keep it maintainable.
• Tidying up later: once the code piles up to a certain point, I have the AI check for unused code or extract repeated parts so it doesn't get messier and messier, then review it once more myself.

I've also tried:
1. Reviewing everything: the safest, but really slow. I eventually realized a lot of simple code doesn't need line-by-line reading.
2. Not looking at all: super fast at first, but the code quickly becomes a mess, until even the AI starts going in circles fixing the wrong things 🫠.

So now I take a middle path, balancing speed and quality: strict where it should be strict, relaxed where it can be. Once, rushing to hit a project deadline, I went two weeks without properly reviewing the code. When I needed to change a feature just before delivery, I found the whole architecture was a total mess, and in the end I spent even more time tearing it down and rewriting it... Now I'd rather spend a bit more time keeping control during development than have my hair on fire later.

How do you all handle it? How do you trade off speed and quality?

#VibeCoding #SoftwareDevelopment #Programming #TechDebt
