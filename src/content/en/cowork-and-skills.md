---
original: 淺談-cowork-與-skills
title: On Cowork and Skills
description: >-
  Two threads in AI agents got clearer this week. Claude Cowork and its
  open-source clones turn agents into desktop coworkers, and Agent Skills turn
  know-how into installable, versioned modules.
tags: []
sourceHash: '6e8d87dbf6f8'
---

Looking at this week's AI agent updates, two main threads have become clearer. The first, kicked off by Claude Cowork, turns agents into coworkers on your desktop. The second turns skills into portable, installable modules, and it's starting to feel a bit like a package ecosystem.

First, the Cowork desktop-work thread. Anthropic launched Claude Cowork, and I don't think the key point is that it chats any better. It's that it puts an agent into your file system in a very intuitive way. You just point it at a folder, and Claude can read and write files within that scope, plan its own steps, and tidy up the results when it's done, like turning screenshots into a spreadsheet or scattered notes into a first draft. For the first time, non-engineers get to use a working mode similar to Claude Code and feel what it's like for AI to grow hands and do things for you.

But Claude Cowork was only for Max users: too expensive, and it doesn't support other models. So within a week Karan Vaidya put together an open-source version, ComposioHQ/open-claude-cowork, and a string of other open-source Openwork projects followed on GitHub, which pushed Anthropic to bring it down to Pro users.

I looked into the open-source Openwork projects and listed a few here. When I have time I'll test them and give more concrete recommendations:

1. ComposioHQ/open-claude-cowork
2. accomplish-ai/openwork
3. langchain-ai/openwork
4. different-ai/openwork
5. eigent-ai/eigent

The arrival of Claude Cowork, or Openwork more broadly, means the public's understanding and use of AI agents is no longer limited to getting suggestions in a chat box. Agents can get things done on your computer and report progress in a way people can accept. I'm looking forward to this line working out, because then agents start to feel like colleagues, not just tools.

Beyond Openwork, this week's second main thread is skills.

If anything, the skills news this week felt more concentrated. Anthropic first proposed the concept of Agent Skills in October 2025, then turned it into an open standard, the Agent Skills format, in December 2025.

In its update on January 14, 2026, Google's Antigravity announced support for skills following the Agent Skills format. Vercel packaged years of its own React and Next.js optimization experience into agent-skills following the Agent Skills format, and provided installers and a directory like add-skill and skills, turning skills into engineering assets that can be distributed and versioned. Interestingly, by npm weekly downloads, the moment giant Vercel showed up, it immediately overtook numman-ali/openskills, an earlier open-source project.

Looking at Antigravity and Vercel together, I think the word "skills" is starting to become very concrete. A skill is essentially a folder containing at least a SKILL.md file (usually along with resources like scripts and references), telling the agent "in this situation, here's what to do, which rules to follow and which tools and steps to use."

When people used to say skills, they often meant something like prompt templates or little tricks. Now it's more like an installable module, with a spec, a directory structure and metadata: a work asset that can be versioned, handed over and reused by multiple agents.

This directly affects how agents will be extended in the future, how work gets handed over, and how teams keep their experience instead of reinventing the wheel every time.

Anthropic also launched new Agent Skills for healthcare and life sciences, including example skills for FHIR development and prior-authorization review. When skills start expanding into fields like healthcare, where processes are dense and must align with regulations, it's a reminder that for agents to get into enterprises, governance and guardrails are unavoidable in the end.

If I had to sum up this week in one sentence: agents are simultaneously becoming more like desktop colleagues and more like maintainable engineering systems. Cowork and Openwork solve "how agents get things done on the desktop"; skills solve "which way of working an agent brings when it does things."

I expect them to be the infrastructure people actually use over the next six months.
