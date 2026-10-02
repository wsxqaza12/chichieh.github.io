---
original: vibe-coding-時代的架構陷阱心得
title: Architecture Traps in the Age of Vibe Coding
description: >-
  Vibe coding with v0 and Supabase nearly turned my project into spaghetti. The
  problem isn't the tools but invisible architecture debt, and how I keep
  service boundaries intact.
tags: []
sourceHash: '81856ef66ef7'
---

Lessons on architecture traps in the age of vibe coding 🪤
I like to think I have a decent sense of system layering; I've designed plenty of API interfaces and service layers. But recently, building fast with v0 (Next.js) + a BaaS like Supabase, I still got fooled by vibe coding's illusion of efficiency and nearly churned out a pile of spaghetti code 🫠

▍The problem isn't the tools. It's invisible architecture debt
Vibe tools hand you code that works right away, but they don't remind you to think about:
- Should this logic live on the frontend or the backend?
- Where are the boundaries of the service layer?
- Should the data aggregation layer reach all the way to the client?

On top of that, the sense of speed that BaaS tools (like Supabase) bring makes it easy for vibe tools to write direct database calls into UI fetches when you're not paying attention. It runs fine at first, but as requirements grow, fetch('/api') calls get scattered everywhere, and the whole project becomes hard to trace and maintain.
Of course, it's not that the frontend can never fetch data, but what to fetch and how is an architecture question, not just a developer-experience question.

▍What I do (for anyone else using a BaaS):
- A BaaS is convenient, but convenient ≠ permission to skip architecture design. Think things through first and you'll save a lot of refactoring later
- Get the API contract and service interfaces clear before you start, because once logic scatters, it's very hard to pull back together
- I wrap every Supabase operation inside a service, which makes permissions, error handling and logic transformations easier to maintain later

Vibe coding is really useful, but don't let "fast" seduce you into blurring development boundaries that should exist 😂. The documentation you should write and the architecture you should plan still need to come first. At least for now, AI can't read your mind (we'll have to hang on a bit longer).

Have you run into something similar? If you've stepped in this pothole or have your own approach, share it in the comments to help everyone avoid it 👇

#VibeCoding #SoftwareArchitecture #BaaS #DevNotes
