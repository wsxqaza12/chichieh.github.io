---
original: pahub
title: 'Meeting Pahud: AI Agent Trends and the Business of MCP'
description: >-
  I skipped a client meeting to meet my idol Pahud in Neihu. On where AI agents
  are heading, why packaging capabilities as MCP is good business, and running
  coding CLIs in the cloud.
tags: []
sourceHash: '6d5f0ed70a72'
---

On Thursday I deliberately skipped a client meeting and went to Neihu to meet my idol, Pahud. Honestly, it was more than worth it. Side note: he's much more handsome in person than his avatar online, which looks kind of like it's made of clay (?).

Hearing Pahud share a lifetime of experience was genuinely rewarding.

What resonated most was where AI agents are heading, and the business model of packaging abstraction-layer capabilities at the MCP level. As people have been saying a lot over the past six months: the future of software is not just human-friendly, but agent-operable.
Compared with the skill designs common today, MCP really does solve the problem of exposing source code more elegantly from a business standpoint.

Is it the final, optimal answer? I don't think it's clear yet, and I'm still experimenting and researching. But either way, I think the direction of providing better infrastructure for AI agents will only get more attractive, and it will definitely be the main battleground where everyone competes.

Pahud also talked about how he now gets coding CLIs and OpenClaw to collaborate on Discord, which really blew my mind 🤯

I'd been thinking about how to get my product-side coding agent to collaborate with OpenClaw on Discord too. I tried all kinds of approaches (like Claude Code Channels and various open-source projects), and Claude Code Channels turned out to be a toy. I'd even considered writing something myself, and then I happened to hear this talk. I'm so grateful. Fired up afterward, I was about to build one by hand following the concept Pahud described, and then, the very next day, he open-sourced it: agent-broker. Naturally I starred it right away, and I recommend everyone support it.

The real pain point this project solves is making "coding CLI in the cloud" actually happen.

It packages a super-lightweight broker written in Rust (Pahud says it uses only 14 MB of memory, how frugal XD) together with your coding CLI in the same cloud pod sandbox. What does that mean? The sandbox can be deployed somewhere far away like Zeabur and connect to Discord on its own!

You no longer have to force your coding agent onto the same machine as your existing OpenClaw gateway. You can finally achieve full physical isolation between the product side and an agent like OpenClaw with off-the-charts automation permissions. No worrying about it wrecking your host configuration. Just give a command in Discord, and it automatically spins up a brand-new thread for you. The whole experience is incredibly smooth 🤣

Finally, Pahud also introduced "four-leg tickets" on the spot, and that flight planning was so tempting... it almost made me want to get into it myself. It was basically a live recruitment session XD

In short, it was a very rewarding fan meetup!? I hope I get the chance to go to something like this again 🤣
