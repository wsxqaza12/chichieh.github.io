---
original: 龍蝦-agent-skill-workflow
title: How I Design Skills and Workflows on OpenClaw
description: >-
  Agent, skill and workflow form a spectrum from flexibility to stability. How I
  move a task along it, and why a good skill beats a badly written workflow.
tags:
  - AIAgent
  - Skill
  - Workflow
  - AICoding
  - OpenClaw
  - BuildInPublic
sourceHash: 'ce7125d0bbf3'
---

![Agent, skill and workflow as a spectrum](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-9.webp)

I recently wrote up how I usually design skills and workflows on OpenClaw, and along the way laid out the differences between three layers, agent, skill and workflow. I think it's worth sharing.

Let's start with two extremes:
Last year, workflow tools like n8n were hot. You break a task into nodes, wire them together, and let the AI follow the flow. It's cheap, stable and predictable, but it can only do what you've defined in advance. Once conditions change, you have to rebuild the flow.

At the other end of the spectrum, you let the agent explore freely and leave everything to the LLM to figure out. It might eventually arrive at the same solution you'd have defined by hand, but it may burn several times the tokens, and the next time it does the same thing, it has to figure it out all over again.

Both have strengths and weaknesses. A fixed flow can't adapt to change. Free exploration is very flexible, but without organizing and locking in what it learned, the experience never really settles into a reusable asset.

So in practice, the more sensible approach is to work in layers.

---

## 1. Agent: let the LLM do everything
You give it a goal, and it thinks, plans, executes and reflects on its own, with the LLM running every step. It's the most flexible, and it's good for a first run when you're not yet sure what the process should be. But since every step relies on the LLM to explore and decide, token usage is naturally higher.

## 2. Skill: organize a process you've already run
In my workflow, a skill is more like a reusable module extracted from the agent's exploration. You've locked in the result of the exploration, so the agent doesn't have to figure it out again each time. Compared with a pure agent, a skill usually uses fewer tokens and is more stable, but at heart it's still agentic.

## 3. Workflow: scripts first, LLM second
The point of a workflow is to take control of the process back from the LLM. Simple cases can run linearly as a script, step 1 → step 2 → step 3, in order, then done. More complex ones use a dispatcher to route by condition or run things in parallel. Either way, the script is in charge, and the LLM is only called where language understanding is truly needed. Tokens are usually lowest, speed usually fastest and stability usually highest. The price is weaker adaptability to changes outside the predefined boundaries. Without good fault tolerance, one failed step can take down everything after it, and unlike an agent, it can't find its own way around.

---

The three types form a spectrum: maximum flexibility on the left, maximum stability and efficiency on the right.

My own approach is to first walk the agent through the task by hand to see if the process works. Once it's confirmed, I write it up as a skill to lock it in. If that skill gets used every day and parts of it don't need the LLM's judgment, I push it further into a workflow, running the judgment-free parts as scripts to save tokens.

One very important principle, though: don't rush to upgrade. A good skill is worth much more than a badly written workflow. I used my skills for a while and only converted them to workflows once I was sure the process was really stable, rather than rushing to automate everything from the start. A process should mature naturally, not be forced.

Anthropic's documentation describes a similar idea: start with the simplest architecture and only add complexity when it's needed. Cursor's design follows the same logic: a skill is a dynamically loaded knowledge pack, and a workflow automates the steps that don't need an LLM with scripts.

I think being aware of these layers matters. It's not that everything should be pushed into a workflow. It's knowing where the task in front of you sits on the spectrum right now, and whether it needs to move to the right or is fine where it is. That's a judgment call you have to make yourself.

If you use AI coding agents or raise lobsters, do you layer things like this? Come chat in the comments 🦞
