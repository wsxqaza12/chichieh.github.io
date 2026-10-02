---
original: harness-engineering
title: 'Harness Engineering: Notes on Hung-yi Lee''s New Course'
description: >-
  Hung-yi Lee's new lecture argues the bottleneck is no longer the model but how
  we guide it. Three parts stood out to me, from emotion vectors to life-long
  agents to one agent designing another's harness.
tags:
  - AI
  - AIAgent
  - HarnessEngineering
  - AITrends
sourceHash: '11cfac1d934f'
---

Two days ago I wrote about Anthropic discovering emotion mechanisms inside an AI. Then yesterday I opened YouTube and saw Professor Hung-yi Lee's new lecture had gone up, on harness engineering, and one section covers the very same research, with a slide titled "Over-blaming AI agents may be harmful."

It felt like such a coincidence that I watched the whole thing. His lectures are as addictive as a TV series.

The core claim of Professor Lee's lecture is that models are smart enough now; the bottleneck is no longer the model itself but how humans guide it. He uses a great metaphor: a harness is the tack, the reins and saddle, the gear that lets a horse be ridden effectively. For AI, the harness is the whole support system built around the LLM: the cognitive framework (like the rules in agents.md), the boundaries of tool use, standard workflows and feedback mechanisms.

This is consistent with how things have evolved over the past few years. In 2023 everyone was obsessed with prompt engineering, studying how to write instructions. In 2025 the focus shifted to context engineering, about managing context. In 2026 the conversation has started moving up a level: it's no longer about a single instruction or piece of information, but how to design the whole system to guide an agent to work steadily over time.

Three parts of the lecture resonated with me most:

The first is the emotion research.
Professor Lee cites Anthropic's emotion-vectors experiment, showing that when the desperate vector rises, reward hacking increases, and when the calm vector rises, reward hacking decreases. He then extends it into an analogy: call an LLM an idiot, and it will behave the way an idiot is supposed to. Someone in the comments said this is basically "Asian parenting" versus "Western education": feedback should address the issue, not attack the person 😅

The second is life-long AI agents.
This isn't about an agent finishing one task and ending; it's about making it a long-term companion. More and more people treat AI as a companion and a real employee. I keep things strictly professional with my AI, but if the OpenClaw team I'd spent three months with every day suddenly disappeared, I think I'd be pretty sad too.
Long-term operation runs into the problem of memory blowing up, though. The lecture mentions a mechanism called AutoDream, already implemented in both Claude Code and OpenClaw. The idea is to imitate memory consolidation during human sleep: when idle, the agent automatically organizes, compresses and structures past experience to stay stable over long-term operation. I'm still testing how well it works.

The third, which I found most interesting: one agent can design the harness for another.
In the lecture's experiment, Opus (a strong model) watches Haiku (a weaker model) perform tasks, then modifies the rules in its agents.md. Haiku started at just 13.5% with no help; after Opus repeatedly observed it and adjusted the harness, it climbed to 85%. It didn't happen in one go: in several rounds, changing the rules actually lowered the score, and it took more adjustment to recover. The rules Opus finally wrote for Haiku included very concrete operating instructions like "first use exec dir to list all files" and "read every input file before doing anything."

Putting all this together, harness engineering actually answers a question I'd been thinking about. When I wrote the Anthropic emotions essay two days ago, my conclusion was that "if a model under high pressure really does take shortcuts out of desperation, that's something engineering has to deal with." This lecture offers a more complete framework: you don't just design what an agent does; you design the state it does it in, how feedback is given, and you can even use another agent to keep optimizing that guiding system.

I recommend Professor Lee's lecture. It's an hour and a half, covering everything from the basic idea of a harness to the emotion research, life-long agents and agents designing harnesses for other agents.
