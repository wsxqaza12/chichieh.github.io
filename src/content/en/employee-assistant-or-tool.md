---
original: agent框架比較-員工助理還是工具人
title: 'Employee, Assistant or Tool? How Three Agent Frameworks Really Differ'
description: >-
  Claude Code, OpenClaw and Hermes Agent look similar on a feature list, but
  they define an agent differently at the root. Following their memory design
  shows who each one thinks the agent is.
tags: []
sourceHash: 'ed8de314dd4b'
---

![Claude Code, OpenClaw and Hermes Agent compared](/content-images/%E5%AF%AB%E9%81%8E%E7%9A%84%E6%96%87%E7%AB%A0/%E6%8A%80%E8%A1%93/images/image-1.webp)
"What's the difference between Claude Code, OpenClaw and Hermes Agent?" is probably the question I've been asked most in the past six months. Every time a new framework appears, people inevitably want to lay out the features and compare them.

My own feeling, though, is that feature differences converge within a few months. Whatever tools A can run and whatever APIs it can connect today, B can probably do three months from now. So rather than comparing features, my experience building things over the past six months has made me think more about a different question: how do these frameworks define an "agent" at the root?

They're all called agents, but what should an agent remember? Does memory follow the task, the person, or the agent? These differences in underlying design reflect different ideas about what role an agent plays. This is what I've observed so far, and it may not be entirely right, but it has shaped how I organize my own workflow.

The three most popular frameworks right now, Claude Code, OpenClaw and Hermes Agent, chose completely different paths from the ground up. Let's look at them through the lens of memory.

## Claude Code: an engineering-workflow agent where the project context is the star

Claude Code's official positioning is blunt: it's an agentic coding tool, at heart an agent focused on helping you write code.

The biggest difference from the other two is how it defines an agent's lifecycle. I'd summarize its approach like this: **the agent isn't a long-lived individual employee; it's an execution layer that gets called up within an engineering workflow.**

Its memory design shows this best. Claude Code carries long-term context mainly through CLAUDE.md and auto memory, and memory is split into user, local and project scopes. By default it's tied to three dimensions, "you," "this machine" and "this project," not to any particular agent. Memory belongs to the context that the user and the project accumulate; the agent is an execution unit that gets called up to digest that context, finish the task and leave.

You can have Claude Code handle long-running tasks in the background, or open several sessions to work in parallel, but even if these agents run for a long time, they don't build an individual memory of their own: who I am, what I've done, who I've worked with. When a task ends, what was learned flows back and settles into the user and project context, and the agent itself dissolves.

Of course, Claude Code also has designs like subagents and custom agents. In this essay's categories I won't go into them in detail. You just need to grasp one point: these mechanisms are mainly for dividing up engineering tasks, context isolation, parallel exploration and reusing workflows, not for building a team of AI employees with long-term identities the way OpenClaw does.

The philosophy behind it is clear: **the project context is the star, and agents are how engineering tasks get executed and divided up when they happen.**

If what you need is a powerful executor when writing code or handling tasks, this approach makes a lot of sense. It doesn't need every agent to have its own personality. What it really protects is the codebase's context, engineering conventions, and the cleanliness of task execution.

## OpenClaw (the lobster): independent employees with identity and memory

OpenClaw's design center is the exact opposite: it gives each agent its own identity.

I've been raising OpenClaw agents for a while, and the clearest feeling is that it's like running a tiny company. Architecturally, it designs agents as employees. Each agent has its own independent memory workspace, and memory is tied to "this agent," not to a machine or a project. Agents can hand work off to each other and assign tasks by @mentioning one another.

In Claude Code, an agent is more like "an avatar of the model during one task," dissolved when it's done. In OpenClaw, an agent is an individual with a name, a memory, hands and feet, and an ongoing existence. You're not "calling an AI"; you're "assigning work to an employee."

Once you start treating AI as employees, the way you think about things changes completely. You start thinking about which tasks this agent should own, how it divides work with other agents, which things you can let it run on its own and which absolutely need a human in the loop. These questions rarely come up when using Claude Code, because its design doesn't encourage you to think that way.

## Hermes Agent: a personal assistant that evolves with you

Nous Research's Hermes Agent takes yet another path. Its official positioning is "The agent that grows with you."

If Claude Code's subject is the engineering project's context, and OpenClaw's subject is a set of agent employees with identities, then Hermes's subject is more like a long-lived agent profile that keeps accumulating state.

Its memory is layered. A user-profile layer reasons about your conversations asynchronously in the background, slowly building a model of you that "understands you better and better." A cross-session memory layer uses full-text indexing plus LLM summaries, so new conversations can pull up old context. The most interesting part is that when the agent finishes a complex task, it automatically distills the process into a skill file and uses it directly the next time a similar task comes up.

Hermes's design philosophy is that "experience accumulates into skills, and interaction shapes personality." It assumes you'll spend a long time with the same agent, so it lays track specifically for "self-evolution." That's a completely different worldview from OpenClaw's, where agents are employees who each exist independently and stick to their own jobs.

#Conclusion

Put the three frameworks side by side, and even though everyone is talking about agents, the worldviews underneath are fundamentally different. Claude Code's memory serves the project and the user, and the agent is the execution layer for engineering tasks. OpenClaw's memory is tied to individual agents, and each agent is an employee with an identity and responsibilities. Hermes's memory accumulates in layers in a user profile, and the agent is an assistant that evolves with you.

Feature differences will converge over time. All three may well end up supporting multi-agent collaboration, layered memory and all kinds of tools. But the underlying positioning determines how each framework encourages you to work with AI.

So before choosing a framework, ask yourself what your current workflow needs: an executor that leaves when the job is done, a set of employees who each do their own job, or an assistant that grows with you?

Once you're clear on that, everything after it, from designing how agents divide work, to defining their permissions, to deciding how memory is stored, will fit what you actually have in mind.

---

### Support

If this essay helped you, or you'd like to encourage me to keep writing, you can clap for it or buy me a coffee through the link below. Thank you for your support!
