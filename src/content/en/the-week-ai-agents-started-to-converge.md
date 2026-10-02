---
original: aiagent正在慢慢對齊的一週
title: The Week AI Agents Started to Converge
description: >-
  No big shock this week, just a steadier sense of direction. Agent skills
  became an open standard, agents moved into DevTools and task modes, and agent
  frameworks started to look like systems meant to be maintained.
tags: []
sourceHash: '5e61edd88273'
---

Following on from what I wrote last week, this week's news didn't shock me all over again. Instead it brought a steadier feeling. A lot hasn't changed, but the overall trend has become clearer. I can feel the agent space moving from everyone talking past each other to slowly converging on a way of doing things that people are willing to share.
The most obvious sign is that agent skills are finally heading toward an open standard. Anthropic published the skill spec, so it's no longer tied to a single product, OpenAI's Codex followed right away, and other tools have started supporting it. It's an important turn that's hard to make into a headline. Like MCP last year, it means people are starting to accept that an agent's value isn't in how strong the model is, but in whether skills can be reused, combined and carried from place to place. That's what matters for engineering and product.
If you've actually built agents, you know the skills layer has always been painful: every platform has its own definition, you rewrite it every time, and in the end everyone is reinventing the wheel. I reinvented quite a few wheels myself in the first half of the year. Now people are willing to say, let's align on the format first and do our own thing on top. That's the kind of choice only a maturing market makes.
At the same time, what Google is doing is very consistent too. Chrome lets agents go straight into DevTools to find problems and fix them, a direct demonstration of what it means for agents to be embedded in everyday tools. No more popping up a chat box to tell you something looks off; it reads the error and goes ahead and fixes it. Once users get used to that, their expectations of agents won't go back.
Claude's task mode is also worth watching. It isn't some suddenly amazing new ability; it puts the plan, skills and tool use all in one workspace, and lets you cut in midway and change direction. It's trying to solve an old problem: when an agent is halfway through something, am I watching from the side, or can we work on it together? If that mode of interaction works smoothly, it will affect how a lot of people design agent UIs.
What I think is easier to overlook is that design and development tools are going fully agentic. Google Stitch's parallel editing, TypeScript's Agent Development Kit: these pull agents back into the world engineers know. Types, safety, modularity, parallelism and so on aren't new concepts, but when they show up in agent frameworks, it means agents are no longer experimental projects but systems that need long-term maintenance.
Google also released a report on agent trends for 2026, which I didn't pay much attention to. The predictions overall aren't new. But choosing to put agents into core processes, security and training is itself a statement of position: for them, agents are no longer an add-on feature but the next operating layer. Their recent holiday gift pack is part of laying that groundwork too.
Nothing exploded this week, but I wanted to record these moments anyway, because the technologies that really changed the world often didn't do it in the loudest week, but when everyone quietly started to align.
