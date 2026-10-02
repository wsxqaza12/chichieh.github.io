---
original: 推薦-agent-borker
title: 'agent-broker, Tested: Letting Agents Talk on Discord'
description: >-
  Pahud Hsieh's open-source agent-broker finally let my OpenClaw team and my
  product-side coding agents talk to each other on Discord, while keeping their
  environments isolated.
tags: []
sourceHash: '53240b8fdb57'
---

I recently got Pahud Hsieh's open-source agent-broker up and running, and honestly it's really good. It finally solved the problem of letting my OpenClaw team and the AI on the product side talk to each other smoothly on Discord 🎉

To connect them, I'd tried Claude Code's Channels feature before, but after hitting a few potholes it felt a bit like a toy, mainly because it could only open one session at a time. It didn't have enough flexibility or practicality 😅

Switching to agent-broker made the experience much better. It's lightweight and very easy to deploy. As you can see in the image, after my OpenClaw CTO agent finishes discussing something with me, it can go straight from Discord to the product-side channel and wake up the AI bot that writes code. It even opens a thread automatically to keep coding there, so the whole discussion and development process is transparent and on the record.

The best part, to me, is that this architecture also isolates the environments. Sensitive keys and environment variables like `.env` can stay on the product side for real, instead of being mixed in with the OpenClaw agents. Safe and clean 💪

Once you're dividing work among multiple agents, you really do need a lightweight broker like this to connect bots with different roles. If you're interested, I recommend giving the project a try 🔥

How do you manage conversations and collaboration between multiple agents these days? Share your approach in the comments 👇
