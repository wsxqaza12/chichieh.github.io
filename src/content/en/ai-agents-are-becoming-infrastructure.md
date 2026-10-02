---
original: aiagent正在變成基礎設施
title: AI Agents Are Becoming Infrastructure
description: >-
  Recent agent updates no longer look like one-off features. Six lines of
  development, from browsers and IDEs to agent operating systems and research
  workspaces, show agents turning into work systems.
tags: []
sourceHash: 'cb8065bfb740'
---

![Six lines of AI agent development](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E8%B6%A8%E5%8B%A2%E8%AB%87/images/image.webp)
Over the past few weeks, AI agent updates look less and less like one-off features and more like a few clear lines of development. Put the news together and you can see agents heading toward becoming "work systems."

I've roughly organized the recent changes into six lines:

1. Browsers and IDEs are becoming the agent's body
The signal here keeps getting stronger. Last year it started with standalone browsers like Comet and Atlas; now Google has put Auto Browse into Chrome, letting Gemini carry out multi-step web tasks directly. Vercel's agent-browser has started supporting iOS, and Cloudflare has integrated its agent and workflow systems.

The obvious change in IDEs is that Apple integrated the Claude Agent SDK into Xcode. That's actually important, because it turns the IDE from an editor into an "agent-native development environment." Though Cursor, Antigravity and the like have been doing this for a while, so Apple is a little late.

2. Agent management platforms are appearing (the beginnings of an agent OS)
The update this week that felt most like a system-level product was OpenAI Frontier. What it's doing looks a lot like an agent OS, covering:
- shared memory
- onboarding
- permissions
- feedback loops
- deployment

That means agents are no longer just model APIs; they're becoming a manageable system of digital coworkers. I see Cloudflare's workflow + agent integration as part of the same line.

3. Multi-agent collaboration is entering the product layer
Multi-agent work used to stay mostly in research or demos. Now it's entering products. Perplexity Model Council, for example, has several frontier models answer at once and then reaches a consensus. It's turning "model uncertainty" into a product feature.

Another example: Firecrawl supports parallel agents, running thousands of agents to query web pages at once. Multi-agent is going from concept to infrastructure. I've been researching multi-agent architectures recently too, so if anyone experienced knows this well, I'd love to learn from you.

4. Coding agents are being standardized and reflected on
This line is very clear. An NVIDIA team uses Cursor at scale and tripled code output without the bug rate going up. Cursor launched the Agent Trace open spec, starting to deal with the traceability of agent-generated code. Meanwhile Claude Code added /insights, which can analyze a whole month of usage and suggest workflow improvements.

People are now working on problems like traceability, workflow learning and modeling developer behavior. These signals all point the same way: coding agents are no longer an experiment but a long-term tool. I started using coding agents last year, and the share of code I write myself has kept dropping as the models get better. I'm close to becoming someone who only reviews PRs.

5. Research and writing are getting dedicated workspaces
I really like OpenAI's launch of Prism, but I've found that not many people know about it. Prism is a LaTeX-native cloud workspace that puts GPT-5.2 inside the project, letting the model see the paper's structure, equations, citations and context, and then help with reasoning, rewriting, adding citations and finding literature right in that environment. For researchers it makes a big difference: you don't have to keep moving content back and forth, and the AI no longer gets only a screenshot or a pasted snippet. Meanwhile Perplexity upgraded Deep Research, and the DRACO benchmark is strengthening how research agents are evaluated and how reliable they are.

I see these two as a signal that agents may not eat the world through enterprise processes first. They might start with research workflows, which are dense with text and logic, because that's where a sense of project context is needed most. Recently a lot of the requests I've been getting have come from researchers.


6. Autonomous agents and local deployment are maturing
From Claude Cowork to the OpenClaw boom, and then the Codex app, Cloudflare Sandbox + Moltworker, Helius letting agents generate their own API keys and wallets, and all kinds of other projects big and small.

These updates are all solving how to let agents exist long-term and operate autonomously, turning AI from something you call into an agent that keeps existing. I expect frameworks like this to be the hottest application trend in the second half of the year.


Put these few weeks of updates together and you can clearly feel agents changing from an interface into infrastructure. I'm looking forward to AI gradually moving into the fourth stage, innovators.
